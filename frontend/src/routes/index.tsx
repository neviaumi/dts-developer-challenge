import {
  createFileRoute,
  useLoaderData,
  useRouter,
} from "@tanstack/react-router";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UpdateIcon from "@mui/icons-material/Update";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

export const Route = createFileRoute("/")({
  loader: () => fetch("http://localhost:8000/tasks").then((res) => res.json()),
  component: App,
});

function TaskItem({ task, onEdit, onDelete }) {
  return (
    <Paper
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "4rem",
      }}
    >
      <Typography variant="h1">{task.title}</Typography>
      <Stack
        gap={2}
        sx={{
          width: "10rem",
        }}
      >
        <Button
          startIcon={<UpdateIcon />}
          variant="contained"
          color="secondary"
          onClick={() => onEdit(task)}
        >
          Edit
        </Button>
        <Button
          startIcon={<DeleteIcon />}
          variant="outlined"
          color="secondary"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </Button>
      </Stack>
    </Paper>
  );
}

const TaskMutationModal = forwardRef(
  function TaskMutationModal({ afterSubmit }, ref) {
    const dialogRef = useRef();
    function onDialogClose() {
      dialogRef.current.close();
    }
    const [selectedTask, setSelectedTask] = useState(undefined);
    const isUpdateTask = !!selectedTask?.id;
    useImperativeHandle(ref, () => ({
      showModal: (task) => {
        dialogRef.current.showModal();
        setSelectedTask(task);
      },
    }));
    return (
      <Dialog
        open
        ref={dialogRef}
        component="dialog"
        onClose={onDialogClose}
        sx={{
          backgroundColor: "transparent",
          border: "none",
          padding: 0,
        }}
        slotProps={{
          paper: {
            component: "form",
            onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries(
                (formData as FormData).entries(),
              );

              const taskData = {
                title: formJson.title,
                description: formJson.description,
                status: formJson.status,
                due_date: new Date(formJson.due_date).toUTCString(),
              };

              if (isUpdateTask) {
                // Update existing task
                await fetch(`http://localhost:8000/tasks/${selectedTask.id}`, {
                  method: "PUT",
                  body: JSON.stringify(taskData),
                });
              } else {
                // Create new task
                await fetch("http://localhost:8000/tasks", {
                  method: "POST",
                  body: JSON.stringify(taskData),
                });
              }

              dialogRef.current.close();
              afterSubmit();
            },
          },
        }}
      >
        <DialogTitle>
          {isUpdateTask ? "Update Task" : "Create New Task"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isUpdateTask
              ? "Update the task details below."
              : "Enter the details for the new task below."}
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="title"
            name="title"
            label="Title"
            fullWidth
            variant="standard"
            defaultValue={selectedTask?.title || ""}
          />
          <TextField
            required
            margin="dense"
            id="description"
            name="description"
            label="Description"
            fullWidth
            variant="standard"
            defaultValue={selectedTask?.description || ""}
          />
          <TextField
            required
            margin="dense"
            id="status"
            name="status"
            label="Status"
            fullWidth
            variant="standard"
            defaultValue={selectedTask?.status || "pending"}
          />
          <TextField
            required
            margin="dense"
            id="due_date"
            name="due_date"
            label="Due Date"
            type="date"
            fullWidth
            variant="standard"
            defaultValue={selectedTask?.due_date
              ? new Date(selectedTask.due_date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0]}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onDialogClose}>Cancel</Button>
          <Button type="submit">{isUpdateTask ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>
    );
  },
);

function App() {
  const mutationModalRef = useRef();
  const router = useRouter();
  const { tasks } = useLoaderData({});

  const handleEdit = (task) => {
    mutationModalRef.current.showModal(task);
  };

  const handleDelete = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await fetch(`http://localhost:8000/tasks/${taskId}`, {
        method: "DELETE",
      });
      router.invalidate();
    }
  };

  return (
    <Container
      sx={{
        backgroundColor: "grey.A100",
        paddingY: "2rem",
      }}
    >
      <TaskMutationModal
        ref={mutationModalRef}
        afterSubmit={() => router.invalidate()}
      />
      <Button
        sx={{
          width: "100%",
          height: "4rem",
          marginBottom: "2rem",
        }}
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => mutationModalRef.current.showModal()}
      >
        Create Task
      </Button>

      <Stack gap={4}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </Stack>
    </Container>
  );
}

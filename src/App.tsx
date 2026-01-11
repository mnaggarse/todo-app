import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { addToast } from "@heroui/toast";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { DeleteIcon } from "./icons";
import type { Task } from "./types";

export default function App() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem("tasks");
    return storedTasks ? JSON.parse(storedTasks) : [];
  });
  const [selectedKeys, setSelectedKeys] = useState(() => {
    const storedCompleted = localStorage.getItem("completed");
    return storedCompleted ? new Set(JSON.parse(storedCompleted)) : new Set();
  });
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("completed", JSON.stringify([...selectedKeys]));
  }, [selectedKeys]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date();

    if (!title.trim()) {
      addToast({
        title: "Please enter a task",
        color: "danger",
      });
    } else {
      setTasks((prevTasks) => [
        {
          id: Date.now(),
          title: title.trim(),
          completed: false,
          createdAt: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${date.getDate()}/${
            date.getMonth() + 1
          }/${date.getFullYear()}`,
        },
        ...prevTasks,
      ]);
      setTitle("");
    }
  };

  const deleteTask = (id: number) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const columns = [
    {
      key: "title",
      label: "Task",
    },
    {
      key: "createdAt",
      label: "Date",
    },
    {
      key: "delete",
      label: "Delete",
    },
  ];

  const renderCell = useCallback(
    (task: Task, columnKey: React.Key) => {
      const cellValue = task[columnKey as keyof Task];

      switch (columnKey) {
        case "delete":
          return (
            <Button
              onPress={() => {
                setTaskToDelete(task);
                onOpen();
              }}
              size="sm"
              variant="light"
              isIconOnly
            >
              <DeleteIcon className="text-lg text-danger cursor-pointer active:opacity-50" />
            </Button>
          );
        default:
          return cellValue;
      }
    },
    [onOpen]
  );

  return (
    <>
      <Modal
        className="max-w-[90%]"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="mx-auto mt-4 pb-0">
                Are you sure you want to delete this task?
              </ModalHeader>
              <ModalBody className="text-center">
                {taskToDelete!.title}
              </ModalBody>
              <ModalFooter className="flex justify-between">
                <Button color="default" onPress={onClose} className="font-bold">
                  Close
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    deleteTask(taskToDelete!.id);
                    onClose();
                  }}
                  className="font-bold"
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <main className="max-w-3xl mx-auto px-4 pt-20 pb-12">
        <h1 className="mb-8 text-4xl font-bold text-center">Todo App</h1>

        <Form
          className="w-full mb-6 flex flex-row items-center gap-2"
          onSubmit={addTask}
        >
          <Input
            placeholder="Enter your task"
            type="text"
            variant="faded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button type="submit" color="primary" className="font-bold">
            Add Task
          </Button>
        </Form>

        <Table
          color="primary"
          aria-label="Tasks table"
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          onSelectionChange={setSelectedKeys}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={tasks}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </main>
    </>
  );
}

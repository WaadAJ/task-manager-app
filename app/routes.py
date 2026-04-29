from fastapi import APIRouter, HTTPException
from typing import List

from app.models import Task, TaskCreate


router = APIRouter()

tasks: List[Task] = []


@router.get("/tasks", response_model=List[Task])
def get_tasks():
    return tasks


@router.post("/tasks", response_model=Task)
def create_task(task: TaskCreate):
    new_task = Task(
        id=len(tasks) + 1,
        title=task.title,
        description=task.description,
        completed=False
    )
    tasks.append(new_task)
    return new_task


@router.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, updated_task: TaskCreate):
    for index, task in enumerate(tasks):
        if task.id == task_id:
            tasks[index] = Task(
                id=task_id,
                title=updated_task.title,
                description=updated_task.description,
                completed=task.completed
            )
            return tasks[index]

    raise HTTPException(status_code=404, detail="Task not found")


@router.patch("/tasks/{task_id}/complete", response_model=Task)
def toggle_task_completion(task_id: int):
    for task in tasks:
        if task.id == task_id:
            task.completed = not task.completed
            return task

    raise HTTPException(status_code=404, detail="Task not found")


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    for task in tasks:
        if task.id == task_id:
            tasks.remove(task)
            return {"message": "Task deleted successfully"}

    raise HTTPException(status_code=404, detail="Task not found")
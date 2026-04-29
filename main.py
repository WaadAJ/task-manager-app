from fastapi import FastAPI

from app.database import Base, engine
from app.routes import router
from app import task_model


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager API")

app.include_router(router)


@app.get("/")
def home():
    return {"message": "Task Manager API is running"}
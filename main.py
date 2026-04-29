from fastapi import FastAPI

from app.routes import router


app = FastAPI(title="Task Manager API")

app.include_router(router)


@app.get("/")
def home():
    return {"message": "Task Manager API is running"}
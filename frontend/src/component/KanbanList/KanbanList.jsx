// import React from 'react'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';

function KanbanList() {
    const [tasks, setTasks] = useState([]);
  const user = localStorage.getItem('username');

  useEffect(() => {
    axios.get('http://localhost:8000/task/showtask')
      .then(response => {
        setTasks(response.data.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/task/taskdelete/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(result.source.index, 1);
    movedTask.status = result.destination.droppableId;
    updatedTasks.splice(result.destination.index, 0, movedTask);
    setTasks(updatedTasks);

    try {
      await axios.put('http://localhost:8000/task/taskupdate', {
        id: movedTask._id,
        title: movedTask.title,
        description: movedTask.description,
        status: movedTask.status,
        priority: movedTask.priority,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const columns = ['Backlog', 'In Progress', 'Completed'];
  return (
    <div>
         <div className="container mt-4">
     <h1 className="text-center">Kanban Board</h1>
       <DragDropContext onDragEnd={handleDragEnd}>
       <div className="row">
          {columns.map((status) => (
            <div key={status} className="col-md-4">
              <h3 className="text-center">{status}</h3>
              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="border p-3 bg-light rounded"
                    style={{ minHeight: "300px" }}
                  >
                    {tasks.filter(task => task.status === status).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="card mb-3"
                          >
                            <div className="card-body">
                              <h5 className="card-title">{task.title}</h5>
                              <p className="card-text">{task.description}</p>
                              <p className="badge bg-primary">{task.priority}</p>
                              {user ? (
                                <div className="mt-2">
                                  <Link to={`/taskedit/${task._id}`} className='btn btn-info mx-2'>Edit</Link>
                                  <button className='btn btn-danger' onClick={() => handleDelete(task._id)}>Delete</button>
                                </div>
                              ) : (
                                <p className="text-muted">To update or delete your task, please log in first</p>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
      
    </div>
  )
}

export default KanbanList

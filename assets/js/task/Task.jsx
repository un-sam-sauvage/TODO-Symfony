import React, { useCallback, useEffect, useRef, useState } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { useFetch, usePaginatedFetch } from "./hooks";
import { useToggle } from "@uidotdev/usehooks";

const Tasks = React.memo(() => {
    const {items: tasks, load, loading} = usePaginatedFetch('/task')
    const [showForm, toggleShowForm] = useToggle(false)
    
    useEffect(() => {
        load()
    }, []);

    return <div>
        {/* loading ? 'Chargement...' : ''*/}
        {/* équivalent */}
        <button onClick={toggleShowForm}>Create a new task</button>
        {
            showForm && <FormCreateTask 
            isEdit={false}
            toggleShowForm={toggleShowForm}
            />
        }
        {tasks.map(task => <Task key={task.id} task={task}/>)}
        {loading && 'Chargement...'}
        </div>
})


//TODO: Pensez à rendre modulable pour l'édition d'une tâche
function FormCreateTask({isEdit, toggleShowForm}) {
    const refTitle = useRef(null);
    const refDescription = useRef(null);
    const {load, loading, errors} = useFetch('/task/new');
    const onSubmit = useCallback(e => {
        e.preventDefault();
        load ({
            title: refTitle.current.value,
            description : refDescription.current.value
        })
    })
    return <form onSubmit={onSubmit}>
        <fieldset>
            <a onClick={toggleShowForm}>Close</a>
            <legend>Create a new task</legend>
            <label htmlFor="new-task-title">Title</label>
            <input ref={refTitle} type="text" id="new-task-title" />
            <label htmlFor="new-task-description">Description</label>
            <textarea ref={refDescription} name="new-task-description" id="new-task-description"></textarea>
            <button type="submit">{isEdit ? "Edit" : "Create"}</button>
        </fieldset>
    </form>
}

const Task = React.memo(({task}) => {
    return <div className="task-card">
        <h3 className="task-title">{task.title}</h3>
        <p className="task-description">{task.description}</p>
    </div>
})



class TaskElement extends HTMLElement {
    connectedCallback () {
        render(<Tasks/>, this);
    }

    disconnectCallback() {
        unmountComponentAtNode(this);
    }
}

customElements.define('task-list', TaskElement);
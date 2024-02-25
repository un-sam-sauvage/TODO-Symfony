import React, { useEffect, useState } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { usePaginatedFetch } from "./hooks";
import { useToggle } from "@uidotdev/usehooks";

const Tasks = React.memo(() => {
    const {items: tasks, load, loading} = usePaginatedFetch('/task')
    //Je n'arrive pas à utiliser cette méthode à cause d'un trop grand nombre de render,
    //https://stackoverflow.com/questions/55265604/uncaught-invariant-violation-too-many-re-renders-react-limits-the-number-of-re
    // const [showForm, toggleShowForm] = useState(!!test);
    const [showForm, toggleShowForm] = useToggle(false)
    
    useEffect(() => {
        load()
    }, []);

    return <div>
        {/* loading ? 'Chargement...' : ''*/}
        {/* équivalent */}
        <button onClick={toggleShowForm}>Create a new task</button>
        {tasks.map(task => <Task key={task.id} task={task}/>)}
        {loading && 'Chargement...'}
        </div>
})

function FormCreateTask() {

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
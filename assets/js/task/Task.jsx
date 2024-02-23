import React, { useEffect } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { usePaginatedFetch } from "./hooks";

function Tasks () {
    const {items: tasks, load, loading} = usePaginatedFetch('/task')
    
    useEffect(() => {
        load()
    }, []);

    return <div>
        {/* loading ? 'Chargement...' : ''*/}
        {/* équivalent */}
        {tasks.map(task => <Task key={task.id} task={task}/>)}
        {loading && 'Chargement...'}
        </div>

}

function Task ({task}) {
    return <div>
        <strong>{task.author.username}</strong>
    </div>
}



class TaskElement extends HTMLElement {
    connectedCallback () {
        render(<Tasks/>, this);
    }

    disconnectCallback() {
        unmountComponentAtNode(this);
    }
}

customElements.define('task-list', TaskElement);
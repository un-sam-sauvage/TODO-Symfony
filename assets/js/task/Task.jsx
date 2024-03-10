import React, { useCallback, useEffect, useState } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { useFetch } from "./hooks";
import { useToggle } from "@uidotdev/usehooks";
import { SpinnerComponent } from "../components/SpinnerComponent";
import { IconComponent } from "../components/IconComponent";
import { FormComponent } from "../components/FormComponent";
import { ErrorComponent } from "../components/ErrorComponent";
import { PopupComponent } from "../components/PopupComponent";
import './style/task.css';
import '../../styles/app.css';

function Tasks () {
    const {items: tasks, setItems: setTasks, load, loading} = useFetch('/task', 'GET');
    const [showForm, toggleShowForm] = useToggle(false)
    const addTask = useCallback((task) => {
        setTasks(tasks => [task, ...tasks])
    })
    useEffect(() => {
        load()
    }, []);

    return <div>
        <button className="btn grow primary" onClick={toggleShowForm}>Create a new task</button>
        {
            showForm && <FormComponent 
            route={'/task/new'}
            method={'POST'}
            toggleShowForm={toggleShowForm}
            onCallback={addTask}
            />
        }
        <div id="tasks-container">
        {tasks.map(
            task => <Task 
            key={task.id} 
            task={task} 
            setTasks={setTasks}
            tasks={tasks}
            />
            )}
        </div>
        {loading && <SpinnerComponent />}
        </div>
}

function Task ({task, tasks, setTasks})  {

    const [isEdit, toggleIsEdit] = useToggle(false);
    const [showPopup, toggleShowPopup] = useToggle(false);
    const [isLoading, toggleIsLoading] = useToggle(false);
    
    const [canDelete, setCanDelete] = useState(false)
    const [token, setToken] = useState('');

    //On utilise le useEffect car le setState est asynchrone donc il faut attendre le prochaine rendu du composant afin d'avoir la nouvelle valeur.
    //Or comme le useEffect dépend des deux valeurs que l'on souhaite, il se rechargera dès que l'une d'elle change. Réglant ainsi tout nos soucis. :)
    useEffect(() => {
        if (token != '' && canDelete) {
            loadDelete({
                token: token
            })
        }
    }, [canDelete, token])

    const callbackSetCanDelete = useCallback(() => {
        setCanDelete(true)
        toggleIsLoading();
    })

    const deleteTask = useCallback((tokenRetrieved = null) => {
        //FIXME: Quand il y a une erreur suite à la suppression d'une tâche, le loading reste
        if(tokenRetrieved.token && (errorsToken && errorsToken.error == "" || errorsToken.error == undefined)) {
            setToken(tokenRetrieved.token);
        }
    }, [])

    const getToken = useCallback(e => {
        e.preventDefault();
        loadToken();
        toggleShowPopup();
    }, []);

    const removeTaskFromList = useCallback(() => {
        const newList = tasks.filter((taskItem) => taskItem.id !== task.id);        
        setTasks(newList);
    })

    const updateTask = useCallback((t) => {
        const newTaskList = tasks.map((taskItem) => {
            if (taskItem.id === t.id) {
              const updatedTaskItem = {
                ...taskItem,
                description: t.description,
                title: t.title
              };
      
              return updatedTaskItem;
            }
      
            return taskItem;
          });
      
          setTasks(newTaskList);
    })

    //Il faut bien penser à définir les callbacks avant de les appeler sinon il ne les trouve pas (et en plus ne met pas d'erreur);
    const {load: loadDelete, loading: loadingDelete, errors: errorsDelete} = useFetch('/task/'+ task.id + '/delete', 'DELETE', removeTaskFromList)
    const {load: loadToken, loading: loadingToken, errors: errorsToken} = useFetch('/task/' + task.id + '/get-token', 'GET', deleteTask);

    return <div className="task-card">
        <h3 className="task-title">{task.title}</h3>
        <p className="task-description">{task.description}</p>
        <div className="btn-container">
            <button className="btn grow secondary"  onClick={getToken}><IconComponent iconName={"trash"}/></button>
            <button className="btn grow secondary" onClick={toggleIsEdit}><IconComponent iconName={"pen-to-square"}/></button>
        </div>
        {errorsToken && <ErrorComponent error={errorsToken.error}/>}
        {isEdit && <FormComponent 
            task={task} 
            route={'/task/'+ task.id +'/edit'} 
            method={'PATCH'} 
            toggleShowForm={toggleIsEdit} 
            isEdit={true}
            onCallback={updateTask}
        />}
        {showPopup && <PopupComponent 
            text={"Are you sure to delete this task ?"}
            disabled={true} 
            // Pour éviter les too many renderer, il ne faut pas mettre directement les fonctions.
            //Autre solution, passer par des useCallback mais ça rajoute du code pour une seule ligne
            togglePopup={() => {toggleShowPopup()}} 
            yesCallback={() => {callbackSetCanDelete()}}
            />
        }
        {isLoading && <SpinnerComponent />}
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
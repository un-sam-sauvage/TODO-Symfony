import React from "react";
import { SpinnerComponent } from "./SpinnerComponent";
import { ErrorComponent } from "./ErrorComponent";
import { useRef, useCallback } from "react";
import { useFetch } from "../task/hooks";

export function FormComponent ({
        isEdit = false, 
        toggleShowForm, 
        onCallback = null, 
        task = null, 
        route, 
        method
    }) 
    {
    const refTitle = useRef(null);
    const refDescription = useRef(null);
    const onSuccess = useCallback(taskReturned => {
        if(errors && errors.error == "" || errors.error == undefined) {
            refTitle.current.value = "";
            refDescription.current.value = ""
            toggleShowForm();
            onCallback(taskReturned);
        }
    }, [refTitle, refDescription, onCallback, toggleShowForm])
    const {load, loading, errors} = useFetch(route, method, onSuccess);
    const onSubmit = useCallback(e => {
        e.preventDefault();
        let params = {
            title: refTitle.current.value,
            description : refDescription.current.value
        }
        if (isEdit) {
            params.id = task.id
        }
        load(params)
    })
    return <form onSubmit={onSubmit} className="form-task">
        <fieldset>
            <legend>{isEdit ? "Edit the task" : "Create a new task"}</legend>

            <a className="btn btn-close" onClick={toggleShowForm}>Close</a>

            <label htmlFor="new-task-title">Title</label>
            <input ref={refTitle} type="text" id="new-task-title" defaultValue={isEdit ? task.title : ""}/>

            <label htmlFor="new-task-description">Description</label>
            <textarea ref={refDescription} name="new-task-description" id="new-task-description" defaultValue={isEdit ? task.description : ""}></textarea>

            <button className="btn grow" type="submit" disabled={loading && true}>{isEdit ? "Edit" : "Create"}</button>

            {errors.error && <ErrorComponent error={errors.error}/>}
            {loading && <SpinnerComponent />}
        </fieldset>
    </form>
}
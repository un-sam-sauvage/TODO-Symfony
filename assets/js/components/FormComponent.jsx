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
    return <form onSubmit={onSubmit}>
        <fieldset>
            <a onClick={toggleShowForm}>Close</a>
            <legend>Create a new task</legend>
            <label htmlFor="new-task-title">Title</label>
            <input ref={refTitle} type="text" id="new-task-title" defaultValue={isEdit && task.title}/>
            <label htmlFor="new-task-description">Description</label>
            <textarea ref={refDescription} name="new-task-description" id="new-task-description" defaultValue={isEdit && task.description}></textarea>
            <button type="submit" disabled={loading && true}>{isEdit ? "Edit" : "Create"}</button>
            {errors.error && <ErrorComponent error={errors.error}/>}
            {loading && <SpinnerComponent />}
        </fieldset>
    </form>
}
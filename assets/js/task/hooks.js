import { useCallback, useState } from "react";

async function jsonFetch (url, method = "GET", data = null) {
    const params = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }
    if (data) {
        params.body = JSON.stringify(data);
    }
    console.log(params);
    const response = await fetch(url, params)
    if (response.status === 204) return null;
    let responseData = await response.json();
    if (response.ok) {
        if (typeof responseData == "string") {
            responseData = JSON.parse(responseData)
        }
        return responseData
    } else {
        console.error(responseData);
        throw responseData;
    }
}

export function useFetch (url, method = "POST", callback = null) {
    const [items, setItems] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const load = useCallback(async (data = null)  => {
        try {
            setLoading(true);
            const response = await jsonFetch(url, method, data);
            
            //DEBUG
            if (response) {
                console.log(response);
            } else {
                console.log("pas de contenu dans la réponse")
            }

            if (callback) {
                callback(response);
            } else {
                setItems(response);
            }
        } catch (error) {
            console.error(error);
            setErrors(error);
            setLoading(false);
        }
        setLoading(false);
    }, [url, method, callback]);
    return {
        loading,
        items,
        setItems,
        errors,
        load
    }
}
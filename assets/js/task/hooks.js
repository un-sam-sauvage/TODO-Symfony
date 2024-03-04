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
    }
}

export function usePaginatedFetch (url) {
    //On définit nos hooks
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);

    //On défini la fonction pour éviter de devoir le refaire
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await jsonFetch(url)
            setItems(response);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);

        //le [url] permet de dire de relancer la fonction à chaque fois que url change. On dit qu'il dépend d'url
    }, [url])
    return {
        items,
        setItems,
        load,
        loading
    }
}

export function useFetch (url, method = "POST", callback = null) {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const load = useCallback(async (data = null)  => {
        try {
            setLoading(true);
            const response = await jsonFetch(url, method, data);
            if (callback) {
                callback(response);
            }
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }, [url, method, callback]);
    return {
        loading,
        errors,
        load
    }
}
import { useCallback, useState } from "react";

export function usePaginatedFetch (url) {
    //On définit nos hooks
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);

    //On défini la fonction pour éviter de devoir le refaire
    const load = useCallback(async () => {
        setLoading(true);
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        })
        const responseData = await response.json();
        if (response.ok) {
            setItems(responseData);
        } else {
            console.error(responseData);
        }
        setLoading(false);

        //le [url] permet de dire de relancer la fonction à chaque fois que url change. On dit qu'il dépend d'url
    }, [url])
    return {
        items,
        load,
        loading
    }
}
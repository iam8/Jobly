import { useState, useEffect } from "react";


/**
 * Custom hook for syncing state data (item) with local storage.
 *
 * Params:
 *  - key (string): the key corresponding to the item in local storage. Used to retrieve the item.
 *  - defaultValue: initial item value to store, if the given key doesn't exist in local storage.
 *
 * When the stored item changes:
 *  - If item is null, it is removed from local storage
 *  - Otherwise, stores the item with the given key
 *
 * Returns [item, setItem] for reading and updating the item in state.
 */
function useLocalStorage(key, defaultValue=null) {
    const initItem = localStorage.getItem(key) || defaultValue;
    const [item, setItem] = useState(initItem);

    useEffect(function setKey() {
        if (item === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, item)
        }

    }, [key, item]);

    return [item, setItem];
}


export default useLocalStorage;

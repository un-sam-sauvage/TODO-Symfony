import React, { useCallback, useState } from "react";

export function PopupComponent ({text, togglePopup, yesCallback, disabled}) {
    const [isDisabled, setIsDisabled] = useState(false);
    const callback = useCallback(() => {
        if(disabled) {
            setIsDisabled(true);
        }
        yesCallback();
    })
    return <div>
        <p>{text}</p>
        <button className="btn grow" disabled={isDisabled} onClick={callback}>Yes</button>
        <button className="btn grow" onClick={togglePopup}>No</button>
    </div>
}
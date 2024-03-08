import React from "react";

export function IconComponent({iconName}) {
    return <i className={"fa fa-"+ iconName} aria-hidden='true'></i>
}
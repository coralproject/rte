import cn from "classnames";
import React from "react";

import styles from "./Toolbar.module.css";

export interface ToolbarPropTypes {
  className?: string;
  children?: React.ReactNode[] | React.ReactNode;
}

class Toolbar extends React.Component<ToolbarPropTypes> {
  public render(): React.ReactNode {
    const { className, ...rest } = this.props;
    return <div className={cn(className, styles.toolbar)} {...rest} />;
  }
}

export default Toolbar;

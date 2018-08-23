import cn from "classnames";
import React from "react";

import styles from "./Toolbar.css";

interface PropTypes {
  className?: string;
}

class Toolbar extends React.Component<PropTypes> {
  public render() {
    const { className, ...rest } = this.props;
    return <div className={cn(className, styles.toolbar)} {...rest} />;
  }
}

export default Toolbar;

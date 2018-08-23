import cn from "classnames";
import React, { ButtonHTMLAttributes } from "react";

import styles from "./Button.css";

interface PropTypes extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  activeClassName?: string;
  children?: React.ReactNode;
  active?: boolean;
}

class Button extends React.Component<PropTypes> {
  public render() {
    const {
      className,
      children,
      active,
      activeClassName,
      ...rest
    } = this.props;
    return (
      <button
        className={cn(className, styles.button, {
          [cn(styles.active, activeClassName)]: active,
        })}
        {...rest}
      >
        {children}
      </button>
    );
  }
}

export default Button;

import cn from "classnames";
import React, { ButtonHTMLAttributes } from "react";

import styles from "./Button.module.css";

export interface ButtonPropTypes
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
  active?: boolean;
  component?: React.ComponentType<any>;
}

class Button extends React.Component<ButtonPropTypes> {
  public render(): React.ReactNode {
    const { className, children, active, component, ...rest } = this.props;
    const Component = component || "button";
    return (
      <Component
        type="button"
        className={cn(className, { [styles.button]: !component })}
        aria-pressed={active}
        {...rest}
      >
        {children}
      </Component>
    );
  }
}

export default Button;

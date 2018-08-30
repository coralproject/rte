import React, { ComponentType, KeyboardEvent } from "react";

import Button from "../components/Button";
import { API } from "../lib/api";
import { Feature } from "../RTE";

export interface TogglePropTypes {
  api: API;
  className?: string;
  title?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

interface State {
  active: boolean;
  disabled: boolean;
}

interface CreateToggleOptions {
  onEnter?: (this: API, node: Node) => boolean;
  onShortcut?: (this: API, e: KeyboardEvent) => boolean;
  isActive?: (this: API) => boolean;
  isDisabled?: (this: API) => boolean;
}

/**
 *  createToggle creates a button that can be active, inactive or disabled
 *  and reacts on clicks. All callbacks are bound to the API instance.
 */
const createToggle = (
  execCommand: (this: any) => void,
  {
    onEnter,
    onShortcut,
    isActive = () => false,
    isDisabled = () => false,
  }: CreateToggleOptions = {}
) => {
  class Toggle extends React.Component<TogglePropTypes, State>
    implements Feature {
    public state = {
      active: false,
      disabled: false,
    };

    private unmounted = false;
    private execCommand = () => execCommand.apply(this.props.api);

    public isActive = () => isActive.apply(this.props.api);
    public isDisabled = () => isDisabled.apply(this.props.api);
    public onEnter = (...args: any[]) =>
      onEnter && onEnter.apply(this.props.api, args);
    public onShortcut = (...args: any[]) =>
      onShortcut && onShortcut.apply(this.props.api, args);

    public onSelectionChange() {
      this.syncState();
    }

    public componentWillUnmount() {
      this.unmounted = true;
    }

    private formatToggle = () => {
      this.execCommand();
    };

    private handleClick = () => {
      this.props.api.focus();
      this.formatToggle();
      this.props.api.focus();
      setTimeout(() => !this.unmounted && this.syncState());
    };

    private syncState = () => {
      if (this.state.active !== this.isActive()) {
        this.setState(state => ({
          active: !state.active,
        }));
      }
      if (this.state.disabled !== this.isDisabled()) {
        this.setState(state => ({
          disabled: !state.disabled,
        }));
      }
    };

    public render() {
      const { className, title, children, disabled } = this.props;
      return (
        <Button
          className={className}
          title={title}
          onClick={this.handleClick}
          active={this.state.active}
          disabled={disabled || this.state.disabled}
        >
          {children}
        </Button>
      );
    }
  }

  return Toggle as ComponentType<TogglePropTypes>;
};

export default createToggle;

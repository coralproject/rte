import React, { ComponentType } from "react";
import Squire from "squire-rte";

import Button from "../components/Button";
import { Feature } from "../RTE";

export interface TogglePropTypes {
  className?: string;
  title?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export interface InjectedProps {
  /** Reference to squire */
  squire: Squire;
  /** ctrlKey dependend on the OS. Used to create shortcuts. */
  ctrlKey: string;
}

interface State {
  active: boolean;
  disabled: boolean;
}

interface CreateToggleOptions<AdditionalProps> {
  isActive?: (squire: Squire, props: AdditionalProps) => boolean;
  isDisabled?: (squire: Squire, props: AdditionalProps) => boolean;
  shortcuts?: (
    ctrlKey: string
  ) => Record<
    string,
    (
      squire: Squire,
      event: KeyboardEvent,
      range: Range,
      props: AdditionalProps
    ) => void
  >;
}

/**
 *  createToggle creates a button that can be active, inactive or disabled
 *  and reacts on clicks. All callbacks are bound to the API instance.
 */
function createToggle<AdditionalProps>(
  execCommand: (squire: Squire, props: AdditionalProps) => void,
  {
    isActive = () => false,
    isDisabled = () => false,
    shortcuts
  }: CreateToggleOptions<AdditionalProps> = {}
): ComponentType<TogglePropTypes & AdditionalProps> {
  class Toggle
    extends React.Component<
      TogglePropTypes & InjectedProps & AdditionalProps,
      State
    >
    implements Feature {
    public state = {
      active: false,
      disabled: false
    };

    private unmounted = false;
    private syncInProgress = false;

    private execCommand = () => execCommand(this.props.squire, this.props);
    private isActive = () =>
      document.activeElement === this.props.squire.getRoot() &&
      isActive(this.props.squire, this.props);
    private isDisabled = () => isDisabled(this.props.squire, this.props);

    public constructor(
      props: TogglePropTypes & InjectedProps & AdditionalProps
    ) {
      super(props);
      if (shortcuts) {
        const resolved = shortcuts(this.props.ctrlKey);
        Object.keys(resolved).forEach(key => {
          this.props.squire.setKeyHandler(key, (squire, event, range) => {
            event.preventDefault();
            resolved[key](squire, event, range, this.props);
          });
        });
      }
    }

    public onContentEditableFocus() {
      this.syncState();
    }

    public onContentEditableBlur() {
      this.syncState();
    }

    public onPathChange() {
      this.syncState();
    }

    public componentWillUnmount() {
      this.unmounted = true;
    }

    private handleClick = () => {
      this.execCommand();
      this.syncState();
    };

    private syncState = () => {
      if (this.syncInProgress) {
        return;
      }
      this.syncInProgress = true;
      setTimeout(() => {
        this.syncInProgress = false;
        if (this.unmounted) {
          return;
        }
        if (this.state.active !== this.isActive()) {
          this.setState(state => ({
            active: !state.active
          }));
        }
        if (this.state.disabled !== this.isDisabled()) {
          this.setState(state => ({
            disabled: !state.disabled
          }));
        }
      });
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
  return Toggle as any;
}

export default createToggle;

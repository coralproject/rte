import bowser from "bowser";
import cn from "classnames";
import throttle from "lodash/throttle";
import PropTypes from "prop-types";
import React, {
  ClipboardEvent,
  EventHandler,
  FocusEvent,
  KeyboardEvent,
  ReactElement,
} from "react";
import ContentEditable from "react-contenteditable";
import Toolbar from "./components/Toolbar";
import createAPI from "./lib/api";
import {
  cloneNodeAndRange,
  getSelectionRange,
  insertNewLine,
  insertText,
  isSelectionInside,
  replaceNodeChildren,
  replaceSelection,
  selectEndOfNode,
  traverse,
} from "./lib/dom";
import Undo from "./lib/undo";
import styles from "./RTE.css";

export interface Feature {
  onEnter?: (node: Node) => boolean;
  onShortcut?: (e: KeyboardEvent) => boolean;
  isActive?: () => boolean;
  isDisabled?: () => boolean;
  onSelectionChange?: () => void;
  getFeatureInstance?: () => Feature;
}

interface PropTypes {
  features?: Array<ReactElement<any>>;
  inputId?: string;
  onChange?: (data: { text: string; html: string }) => void;
  disabled?: boolean;
  className?: string;
  classNameDisabled?: string;
  contentClassName?: string;
  contentClassNameDisabled?: string;
  contentContainerClassName?: string;
  contentContainerClassNameDisabled?: string;
  toolbarClassName?: string;
  toolbarClassNameDisabled?: string;
  placeholderClassName?: string;
  placeholderClassNameDisabled?: string;
  placeholder?: string;
  value?: string;
  toolbarPosition?: "top" | "bottom";
  onFocus?: EventHandler<FocusEvent>;
  onBlur?: EventHandler<FocusEvent>;
}

class RTE extends React.Component<PropTypes> {
  public static defaultProps = {
    features: [],
    classNameDisabled: "",
    contentClassName: "",
    contentClassNameDisabled: "",
    contentContainerClassName: "",
    contentContainerClassNameDisabled: "",
    toolbarClassName: "",
    toolbarClassNameDisabled: "",
    placeholderClassName: "",
    placeholderClassNameDisabled: "",
    toolbarPosition: "top",
  };

  /// Ref to react-contenteditable
  private contentEditableRef: any = null;
  /// Ref to root container.
  private rootRef: HTMLDivElement | null = null;

  // Our "plugins" api.
  private api = createAPI(
    () => this.contentEditableRef && this.contentEditableRef.htmlEl,
    () => this.handleChange(),
    () => this.undo.canUndo(),
    () => this.undo.canRedo(),
    () => this.handleUndo(),
    () => this.handleRedo(),
    () => this.contentEditableFocus
  );

  // Instance of undo stack.
  private undo = new Undo();

  // Refs to the features.
  private featuresRef: Record<string, Feature> = {};

  // Export this for parent components.
  public focus = () => this.contentEditableRef.htmlEl.focus();

  private unmounted = false;

  /** Does the contenteditable has a focus? */
  private contentEditableFocus = false;

  /** Is focus somewhere inside the root container */
  private focusInsideRoot = false;

  // Should be called on every change to feed
  // our Undo stack. We save the innerHTML and if available
  // a copy of the contentEditable node and a copy of the range.
  private saveCheckpoint = throttle((html, node?, range?) => {
    const meta = [];
    if (node && range) {
      meta.push(...cloneNodeAndRange(node, range));
    }
    this.undo.save(html || "", ...meta);
  }, 1000);

  constructor(props: PropTypes) {
    super(props);
    this.saveCheckpoint(props.value);
  }

  // Returns a handler that fills our `featuresRef`.
  private createFeatureRefHandler(key: string | number) {
    return (ref: any) => {
      if (ref) {
        this.featuresRef[key] = ref;
      } else {
        delete this.featuresRef[key];
      }
    };
  }

  // Ref to react-contenteditable.
  private handleContentEditableRef = (ref: any) =>
    (this.contentEditableRef = ref);

  // Ref to root container.
  private handleRootRef = (ref: any) => (this.rootRef = ref);

  private forEachFeature(callback: (instance: Feature) => void) {
    Object.keys(this.featuresRef).map(k => {
      const instance = this.featuresRef[k].getFeatureInstance
        ? this.featuresRef[k].getFeatureInstance!()
        : this.featuresRef[k];
      callback(instance);
    });
  }

  public componentWillReceiveProps(props: PropTypes) {
    // Clear undo stack if content was set to sth different.
    if (props.value !== this.contentEditableRef.htmlEl.innerHTML) {
      this.undo.clear();
      this.saveCheckpoint(props.value);
      if (isSelectionInside(this.contentEditableRef.htmlEl)) {
        setTimeout(
          () =>
            !this.unmounted && selectEndOfNode(this.contentEditableRef.htmlEl)
        );
      }
    }
  }

  public componentWillUnmount() {
    // Cancel pending stuff.
    this.saveCheckpoint.cancel();
    this.unmounted = true;
  }

  private handleChange = () => {
    // TODO: don't rely on this hack.
    // It removes all `style` attr that
    // remaining execCommand still add.
    traverse(this.contentEditableRef.htmlEl, (n: Node) => {
      // tslint:disable-next-line:no-unused-expression
      (n as Element).removeAttribute && (n as Element).removeAttribute("style");
    });

    if (this.props.onChange) {
      this.props.onChange({
        text: this.contentEditableRef.htmlEl.innerText,
        html: this.contentEditableRef.htmlEl.innerHTML,
      });
    }
    this.contentEditableRef.htmlEl.focus();
    this.saveCheckpoint(
      this.contentEditableRef.htmlEl.innerHTML,
      this.contentEditableRef.htmlEl,
      getSelectionRange()
    );
  };

  private handleSelectionChange = () => {
    // Let features know selection has changeed, so they
    // can update.
    this.forEachFeature(b => {
      // tslint:disable-next-line:no-unused-expression
      b.onSelectionChange && b.onSelectionChange();
    });
  };

  // Allow features to handle shortcuts.
  private handleShortcut = (e: KeyboardEvent) => {
    let handled = false;
    this.forEachFeature(b => {
      if (!handled) {
        handled = !!(b.onShortcut && b.onShortcut(e));
      }
    });
    return handled;
  };

  // Called when Enter was pressed without shift.
  // Traverses from bottom to top and calling
  // feature handlers and stops when one has handled this event.
  private handleSpecialEnter = () => {
    let handled = false;
    const sel = window.getSelection();
    if (!sel) {
      return false;
    }
    const range = sel.getRangeAt(0);
    let container: Node | null = range.startContainer;
    while (
      !handled &&
      container &&
      container !== this.contentEditableRef.htmlEl
    ) {
      this.forEachFeature(b => {
        if (!handled) {
          handled = !!(b.onEnter && b.onEnter(container as HTMLElement));
        }
      });
      container = container.parentNode;
    }
    return handled;
  };

  private handleCut = () => {
    // IE has issues not firing the onChange event.
    if (bowser.msie) {
      setTimeout(() => !this.unmounted && this.handleChange());
    }
  };

  private handleContentEditableFocus = () => {
    this.contentEditableFocus = true;
  };

  private handleContentEditableBlur = () => {
    this.contentEditableFocus = false;
    // Sometimes the onselect event doesn't fire on blur.
    this.handleSelectionChange();
  };

  private handleRootFocus = (e: FocusEvent) => {
    if (this.focusInsideRoot) {
      // Focus already inside, suppress event.
      return;
    }
    this.focusInsideRoot = true;
    // Call event handler if available.
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
  };

  private handleRootBlur = (e: FocusEvent) => {
    if (!this.rootRef || !this.focusInsideRoot) {
      return;
    }
    if (this.rootRef.contains(e.nativeEvent.relatedTarget as Element)) {
      // Focus didn't leave the RTE, suppress event.
      return;
    }
    this.focusInsideRoot = false;
    // Call event handler if available.
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  };

  // We intercept pasting, so that we
  // force text/plain content.
  private handlePaste = (e: ClipboardEvent) => {
    // Get text representation of clipboard
    // This works cross browser.
    const text: string = (
      ((e as any).originalEvent || e).clipboardData ||
      (window as any).clipboardData
    ).getData("Text");

    // IE does this funny thing to change the selection after the paste
    // event, remember the range for now.
    const range = getSelectionRange()!.cloneRange();

    // Run outside of event loop to fix
    // selection issues with IE.
    setTimeout(() => {
      // Manually delete range, cope with IE.
      if (!range.collapsed) {
        range.deleteContents();
      }

      // insert text manually
      insertText(text);
      this.handleChange();
    });

    e.preventDefault();
    return false;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    // IE has issues not firing the onChange event.
    if (bowser.msie) {
      setTimeout(() => !this.unmounted && this.handleChange());
    }

    // Undo Redo 'Z'
    if (e.key === "z" && (e.metaKey || e.ctrlKey)) {
      if (e.shiftKey) {
        this.handleRedo();
      } else {
        this.handleUndo();
      }
      e.preventDefault();
      return false;
    }

    if (e.metaKey || e.ctrlKey) {
      if (this.handleShortcut(e)) {
        e.preventDefault();
        return false;
      }
    }

    // Newlines Or Special Enter Behaviors.
    if (e.key === "Enter") {
      if (!e.shiftKey && this.handleSpecialEnter()) {
        this.handleChange();
        e.preventDefault();
        return false;
      }

      insertNewLine(true);

      this.handleChange();
      e.preventDefault();
      return false;
    }

    return;
  };

  private restoreCheckpoint(html: string, node: Node, range: Range) {
    if (node && range) {
      // We need to clone it, otherwise we'll mutate
      // that original one which can still be in the undo stack.
      const [nodeCloned, rangeCloned] = cloneNodeAndRange(node, range);

      // Remember range values, as `rangeCloned` can changed during
      // DOM manipulation.
      const startOffset = rangeCloned.startOffset;
      const endOffset = rangeCloned.startOffset;

      // Rewrite startContainer if it was pointing to `nodeCloned`.
      const startContainer =
        rangeCloned.startContainer === nodeCloned
          ? this.contentEditableRef.htmlEl
          : rangeCloned.startContainer;

      // Rewrite endContainer if it was pointing to `nodeCloned`.
      const endContainer =
        rangeCloned.endContainer === nodeCloned
          ? this.contentEditableRef.htmlEl
          : rangeCloned.endContainer;

      // Replace children with the ones from nodeCloned.
      replaceNodeChildren(this.contentEditableRef.htmlEl, nodeCloned);

      // Now setup the selection range.
      const finalRange = document.createRange();
      finalRange.setStart(startContainer, startOffset);
      finalRange.setEnd(endContainer, endOffset);

      // SELECT!
      replaceSelection(finalRange);
    } else {
      this.contentEditableRef.htmlEl.innerHTML = html;
      selectEndOfNode(this.contentEditableRef.htmlEl);
    }
    this.handleChange();
  }

  private handleUndo() {
    this.saveCheckpoint.flush();
    if (this.undo.canUndo()) {
      const [html, node, range] = this.undo.undo();
      this.restoreCheckpoint(html, node, range);
    }
  }

  private handleRedo() {
    this.saveCheckpoint.flush();
    if (this.undo.canRedo()) {
      const [html, node, range] = this.undo.redo();
      this.restoreCheckpoint(html, node, range);
    }
  }

  private renderFeatures() {
    return (
      this.props.features &&
      this.props.features.map((b, i) => {
        return React.cloneElement(b, {
          disabled: this.props.disabled,
          api: this.api,
          key: b.key || i,
          ref: this.createFeatureRefHandler(b.key || i),
        });
      })
    );
  }

  private getClassNames() {
    const { disabled, toolbarPosition } = this.props;
    return {
      toolbar: cn(this.props.toolbarClassName, {
        [this.props.toolbarClassNameDisabled!]: disabled,
        [styles.toolbarDisabled]: disabled,
        [styles.toolbarTop]: toolbarPosition === "top",
        [styles.toolbarBottom]: toolbarPosition === "bottom",
      }),
      contentContainer: cn(
        styles.contentEditableContainer,
        this.props.contentContainerClassName,
        {
          [this.props.contentContainerClassNameDisabled!]: disabled,
          [styles.contentEditableContainerDisabled]: disabled,
        }
      ),
      content: cn(styles.contentEditable, this.props.contentClassName, {
        [this.props.contentClassNameDisabled!]: disabled,
        [styles.contentEditableDisabled]: disabled,
      }),
      root: cn(styles.root, this.props.className, {
        [this.props.classNameDisabled!]: disabled,
      }),
      placeholder: cn(styles.placeholder, this.props.placeholderClassName, {
        [this.props.placeholderClassNameDisabled!]: disabled,
      }),
    };
  }

  public render() {
    const {
      value,
      placeholder,
      inputId,
      toolbarPosition,
      disabled,
    } = this.props;

    const classNames = this.getClassNames();

    const contentEditableProps: any = {
      id: inputId,
      onKeyDown: this.handleKeyDown,
      onPaste: this.handlePaste,
      onCut: this.handleCut,
      onFocus: this.handleContentEditableFocus,
      onBlur: this.handleContentEditableBlur,
      onSelect: this.handleSelectionChange,
      className: classNames.content,
      ref: this.handleContentEditableRef,
      html: value || "",
      disabled,
      onChange: this.handleChange,
    };

    if (placeholder) {
      contentEditableProps["aria-placeholder"] = placeholder;
    }

    return (
      <div
        className={classNames.root}
        onFocus={this.handleRootFocus}
        onBlur={this.handleRootBlur}
        ref={this.handleRootRef}
      >
        {toolbarPosition === "top" && (
          <Toolbar className={classNames.toolbar}>
            {this.renderFeatures()}
          </Toolbar>
        )}
        <div className={styles.contentEditableContainer}>
          <ContentEditable {...contentEditableProps} />
          {!value &&
            placeholder && (
              <div aria-hidden="true" className={classNames.placeholder}>
                {placeholder}
              </div>
            )}
        </div>
        {toolbarPosition === "bottom" && (
          <Toolbar className={classNames.toolbar}>
            {this.renderFeatures()}
          </Toolbar>
        )}
      </div>
    );
  }
}

export default RTE;

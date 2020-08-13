import cn from "classnames";
import PropTypes from "prop-types";
import Squire from "squire-rte";
import React, {
  EventHandler,
  FocusEvent,
  ReactElement,
  HTMLAttributes,
} from "react";
import Toolbar from "./components/Toolbar";
import styles from "./RTE.module.css";
import { getBrowserInfo } from "./lib/browserInfo";

export interface Feature {
  onPathChange?: () => void;
  onContentEditableFocus?: () => void;
  onContentEditableBlur?: () => void;
}

interface PasteEvent {
  fragment: DocumentFragment;
  preventDefault: () => void;
  defaultPrevented: boolean;
}

interface PropTypes {
  /** features is an array of RTE features to be included */
  features?: ReactElement<any>[];
  /** inputID is the id attached to the contenteditable field */
  inputID?: string;
  /** onChange is called whenenver the `html` value has changed */
  onChange?: (html: string) => void;
  /** disabled lets you turn on/off the RTE */
  disabled?: boolean;
  /** className added to the root */
  className?: string;
  /** className added to the root when disabled */
  classNameDisabled?: string;
  /** className added to the html content */
  contentClassName?: string;
  /** className added to the html content when disabled */
  contentClassNameDisabled?: string;
  /** className added to the html content container */
  contentContainerClassName?: string;
  /** className added to the html content container when disabled */
  contentContainerClassNameDisabled?: string;
  /** className added to the toolbar */
  toolbarClassName?: string;
  /** className added to the toolbar when disabled */
  toolbarClassNameDisabled?: string;
  /** className added to the placeholder */
  placeholderClassName?: string;
  /** className added to the placeholder when disabled */
  placeholderClassNameDisabled?: string;
  /** placeholder to show when RTE is empty */
  placeholder?: string;
  /** current html value */
  value?: string;
  /** toolbarPosition lets you switch the toolbar to top/bottom */
  toolbarPosition?: "top" | "bottom";
  /** onFocus is called whenenver the RTE receives focus */
  onFocus?: EventHandler<FocusEvent>;
  /** onFocus is called whenenver the RTE looses focus */
  onBlur?: EventHandler<FocusEvent>;

  /** onWillPaste is called whenenver the RTE receives paste event */
  onWillPaste?: (event: PasteEvent) => void;
  /** Only allow pasting text */
  pasteTextOnly?: boolean;
  /**
   * Sanitize when `value` is applied. Defaults to `true`.
   * Important: No sanitization will take place unless `sanitizeToDOMFragment` is set.
   */
  sanitizeValue?: boolean;
  /**
   * Function to call when sanitizing HTML, this will also allow pasting HTML
   * if not disabled by `pasteTextOnly`.
   *
   * Can be used with DOMPurify:
   * ```
   * const sanitizeToDOMFragment = (html: string) => {
   *   if (!html) {
   *     return document.createDocumentFragment()
   *   }
   *   return DOMPurify.sanitize(html, { RETURN_DOM_FRAGMENT: true });
   * };
   */
  sanitizeToDOMFragment?: (
    html: string,
    isPaste: boolean,
    self: Squire
  ) => DocumentFragment;
}

interface State {
  initialized: boolean;
}

class RTE extends React.Component<PropTypes, State> {
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
    sanitizeValue: true,
  };

  /// Ref to squire node.
  private contentEditableRef: HTMLDivElement | null = null;
  /// Ref to root container.
  private rootRef: HTMLDivElement | null = null;

  // Refs to the features.
  private featuresRef: Record<string, Feature> = {};

  // Export this for parent components.
  public focus = () => this.squire.focus();

  /** Is focus somewhere inside the root container */
  private focusInsideRoot = false;

  private squire: Squire;

  private ctrlKey = getBrowserInfo().macOS ? "meta-" : "ctrl-";

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

  private initSquire = () => {
    this.squire = new Squire(this.contentEditableRef!, {
      isInsertedHTMLSanitized: Boolean(this.props.sanitizeToDOMFragment),
      isSetHTMLSanitized:
        Boolean(this.props.sanitizeToDOMFragment) && this.props.sanitizeValue,
      sanitizeToDOMFragment: this.props.sanitizeToDOMFragment,
    });
    this.squire.addEventListener("pathChange", this.handlePathChange);
    this.squire.addEventListener("input", this.handleChange);
    this.squire.addEventListener("willPaste", this.handlePasteText);
    this.squire.addEventListener("focus", this.handleContentEditableFocus);
    this.squire.addEventListener("blur", this.handleContentEditableBlur);

    // Reset shortcuts. We add shortcuts through the added features.
    [
      this.ctrlKey + "b",
      this.ctrlKey + "i",
      this.ctrlKey + "u",
      this.ctrlKey + "shift-7",
      this.ctrlKey + "shift-5",
      this.ctrlKey + "shift-6",
      this.ctrlKey + "shift-8",
      this.ctrlKey + "shift-9",
      this.ctrlKey + "shift-[",
      this.ctrlKey + "shift-]",
      this.ctrlKey + "shift-d",
    ].forEach((key) => this.squire.setKeyHandler(key, null));

    // Set current value.
    if (this.props.value) {
      this.squire.modifyDocument(() => {
        this.squire.setHTML(this.props.value!);
        this.contentEditableRef!.setAttribute(
          "contenteditable",
          JSON.stringify(!this.props.disabled)
        );
      });
    }
  };

  /** Ref to react-contenteditable. */
  private handleContentEditableRef = (ref: any) => {
    this.contentEditableRef = ref;
    if (ref) {
      this.initSquire();
      this.setState({ initialized: true });
    }
  };

  /** Ref to root container. */
  private handleRootRef = (ref: any) => (this.rootRef = ref);

  /** iterate through each feature */
  private forEachFeature(callback: (instance: Feature) => void) {
    Object.keys(this.featuresRef).map((k) => {
      callback(this.featuresRef[k]);
    });
  }

  public componentDidUpdate() {
    if (this.contentEditableRef) {
      // Enable/disable through the use of `contenteditable` attr.
      const contenteditable = JSON.stringify(!this.props.disabled);
      if (
        this.contentEditableRef.getAttribute("contenteditable") !==
        contenteditable
      ) {
        this.squire.modifyDocument(() => {
          this.contentEditableRef!.setAttribute(
            "contenteditable",
            contenteditable
          );
        });
      }
      // Change html if `value` changed.
      if (this.props.value !== this.squire.getHTML()) {
        this.squire.modifyDocument(() => {
          this.squire.setHTML(this.props.value || "");
        });
      }
    }
  }

  private handleChange = () => {
    if (this.props.onChange) {
      this.props.onChange(this.squire.getHTML());
    }
  };

  private handlePathChange = () => {
    // Let features know path has changed, so they
    // can update.
    this.forEachFeature((b) => {
      if (b.onPathChange) {
        b.onPathChange();
      }
    });
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

    // Clear selection range seems to fix a weird bug:
    // Disabling, clearing and reenabling the RTE leaves
    // selection in a weird state where making lists fail to work.
    // Only reproduced in Chrome 81.0.4044.129.
    window.getSelection()?.removeAllRanges();

    this.focusInsideRoot = false;
    // Call event handler if available.
    if (this.props.onBlur) {
      this.props.onBlur(e);
    }
  };

  private handleContentEditableFocus = (e: FocusEvent) => {
    this.forEachFeature((b) => {
      if (b.onContentEditableFocus) {
        b.onContentEditableFocus();
      }
    });
  };

  private handleContentEditableBlur = (e: FocusEvent) => {
    this.forEachFeature((b) => {
      if (b.onContentEditableBlur) {
        b.onContentEditableBlur();
      }
    });
  };

  private handlePasteText = (event: PasteEvent) => {
    if (this.props.pasteTextOnly || !this.props.sanitizeToDOMFragment) {
      this.handlePasteTextOnly(event);
    }
    if (this.props.onWillPaste) {
      this.props.onWillPaste(event);
    }
  };

  // We intercept pasting, so that we
  // force text/plain content if `pasteTextOnly` is set.
  private handlePasteTextOnly = (event: {
    fragment: DocumentFragment;
    preventDefault: () => void;
    defaultPrevented: boolean;
  }) => {
    // Remove html.
    // eslint-disable-next-line no-self-assign
    event.fragment.textContent = event.fragment.textContent;
  };

  private renderFeatures() {
    if (!this.squire) {
      return null;
    }
    return (
      this.props.features &&
      this.props.features.map((b, i) => {
        return React.cloneElement(b, {
          disabled: this.props.disabled,
          squire: this.squire,
          ctrlKey: this.ctrlKey,
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
    const { value, placeholder, inputID, toolbarPosition } = this.props;

    const classNames = this.getClassNames();

    const contentEditableProps: HTMLAttributes<HTMLDivElement> = {
      id: inputID,
      className: classNames.content,
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
        <div className={classNames.contentContainer}>
          <div {...contentEditableProps} ref={this.handleContentEditableRef} />
          {(!value || value === "<div><br></div>") && placeholder && (
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

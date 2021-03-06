import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import ResizeObserver from '../Helpers/ResizeObserver';

/**
 * The `TextArea` component is used to allow a dynamic height for the
 * `textarea`. The height will keep on changing until the maxRows prop
 * is met or infinitely if it does not exist, or is 0.
 */
export default class TextArea extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    style: PropTypes.object,
    className: PropTypes.string,
    rows: PropTypes.number.isRequired,
    maxRows: PropTypes.number,
    onChange: PropTypes.func,
    defaultValue: PropTypes.string,
    floatingLabel: PropTypes.bool,
    value: PropTypes.string,
    block: PropTypes.bool,
    label: PropTypes.node,
  };

  constructor(props) {
    super(props);

    this.state = { height: null };
    this.focus = this.focus.bind(this);
    this.getField = this.getField.bind(this);
    this.getValue = this.getValue.bind(this);
    this._setMask = this._setMask.bind(this);
    this._setField = this._setField.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleResize = this._handleResize.bind(this);
    this._syncHeightWithMask = this._syncHeightWithMask.bind(this);
  }

  componentDidMount() {
    this._rowHeight = this._calcRowHeight();
    this._syncHeightWithMask();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.rows !== nextProps.rows) {
      this._rowHeight = this._calcRowHeight(nextProps);
    }

    if (this.props.value !== nextProps.value || this.props.maxRows !== nextProps.maxRows) {
      this._syncHeightWithMask(nextProps.value);
    }
  }

  getField() {
    return this._field;
  }

  getValue() {
    return this._field.value;
  }

  focus() {
    this._field.focus();
  }

  blur() {
    this._field.blur();
  }

  _calcRowHeight = ({ rows } = this.props) => {
    if (!this._field) {
      return 19;
    }

    const height = this._field.style.height;
    this._field.style.height = 'auto';
    const rowHeight = this._field.offsetHeight / rows;
    this._field.style.height = height;
    return rowHeight;
  };

  _setMask(mask) {
    this._mask = mask;
  }

  _setField(field) {
    this._field = field;
  }

  _handleResize() {
    this._rowHeight = this._calcRowHeight();
    this._syncHeightWithMask();
  }

  _syncHeightWithMask(value) {
    if (!this._mask) { // mask isn't set for base snapshot rendering.
      return;
    }

    if (value !== undefined) {
      this._mask.value = value;
    }

    let height = this._mask.scrollHeight;
    if (height === undefined) {
      return;
    }

    const { rows, maxRows } = this.props;
    if (maxRows && maxRows > 0) {
      height = Math.min(height, this._rowHeight * maxRows);
    }

    height = Math.max(this._rowHeight * rows, height);
    this.setState({ height });
  }

  _handleChange(e) {
    this._syncHeightWithMask(e.target.value, e);

    if (this.props.onChange) {
      this.props.onChange(e);
    }
  }

  render() {
    const { height } = this.state;

    const {
      style,
      defaultValue,
      value,
      className,
      label,
      block,
      ...props
    } = this.props;
    delete props.maxRows;
    delete props.onChange;

    return (
      <div
        style={{ height: height && height + 5 }}
        className={cn('md-text-field-multiline-container', {
          'md-text-field--margin': !label && !block,
          'md-text-field--floating-margin': label && !block,
        })}
      >
        <ResizeObserver watchWidth onResize={this._handleResize} />
        <textarea
          ref={this._setMask}
          className={cn(className, 'md-text-field--multiline-mask')}
          readOnly
          rows={props.rows}
          tabIndex={-1}
          style={style}
          defaultValue={defaultValue}
          aria-hidden
          value={value}
        />
        <textarea
          {...props}
          ref={this._setField}
          style={Object.assign({}, style, { height })}
          className={className}
          defaultValue={defaultValue}
          value={value}
          onChange={this._handleChange}
        />
      </div>
    );
  }
}

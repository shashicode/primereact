import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import KeyFilter from "../keyfilter/KeyFilter";
import Tooltip from "../tooltip/Tooltip";

export class InputText extends Component {

    static defaultProps = {
        onInput: null,
        onKeyPress: null,
        keyfilter: null,
        validateOnly: false,
        tooltip: null,
        tooltipOptions: null
    };

    static propTypes = {
        onInput: PropTypes.func,
        onKeyPress: PropTypes.func,
        keyfilter: PropTypes.any,
        validateOnly: PropTypes.bool,
        tooltip: PropTypes.string,
        tooltipOptions: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.onInput = this.onInput.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
    }

    onKeyPress(event) {
        if (this.props.onKeyPress) {
            this.props.onKeyPress(event);
        }

        if (this.props.keyfilter) {
            KeyFilter.onKeyPress(event, this.props.keyfilter, this.props.validateOnly)
        }
    }

    onInput(event) {
        let validatePattern = true;
        if (this.props.keyfilter && this.props.validateOnly) {
            validatePattern = KeyFilter.validate(event, this.props.keyfilter);
        }

        if (this.props.onInput) {
            this.props.onInput(event, validatePattern);
        }
    }

    componentDidMount() {
        if (this.props.tooltip) {
            this.tooltip = new Tooltip({
                target: this.inputEl,
                content: this.props.tooltip,
                options: this.props.tooltipOptions
            });
        }
    }

    componentWillUnmount() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
    }

    render() {
        const className = classNames('p-inputtext p-component', this.props.className, {
            'p-disabled': this.props.disabled,
            'p-state-filled': this.props.value && this.props.value.length
        });

        let inputProps = Object.assign({}, this.props);
        delete inputProps.onInput;
        delete inputProps.onKeyPress;
        delete inputProps.keyfilter;
        delete inputProps.validateOnly;
        delete inputProps.tooltip;
        delete inputProps.tooltipOptions;

        return <input ref={(el) => this.inputEl = el} {...inputProps} className={className} onInput={this.onInput} onKeyPress={this.onKeyPress}/>;
    }
}
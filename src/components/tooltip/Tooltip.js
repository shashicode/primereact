import DomHandler from '../utils/DomHandler';

export default class Tooltip  {

    constructor(props) {
        this.target = props.target;
        this.content = props.content;
        this.options = props.options;
        this.options.event = this.options.event || 'hover';
        this.options.position = this.options.position || 'right';

        this.bindEvents();
    }

    bindEvents() {
        if (this.options.event === 'hover') {
            this.mouseEnterListener = this.activate.bind(this);
            this.mouseLeaveListener = this.deactivate.bind(this);
            this.target.addEventListener('mouseenter', this.mouseEnterListener);
            this.target.addEventListener('mouseleave', this.mouseLeaveListener);
        }
        else if (this.options.event === 'focus') {
            this.focusListener = this.activate.bind(this);
            this.blurListener = this.deactivate.bind(this);
            this.target.addEventListener('focus', this.focusListener);
            this.target.addEventListener('blur', this.blurListener);
        }
    }

    unbindEvents() {
        if (this.options.event === 'hover') {
            this.target.removeEventListener('mouseenter', this.mouseEnterListener);
            this.target.removeEventListener('mouseleave', this.mouseLeaveListener);
        }
        else if (this.options.event === 'focus') {
            this.target.removeEventListener('focus', this.focusListener);
            this.target.removeEventListener('blur', this.blurListener);
        }
    }

    activate() {
        this.clearHideTimeout();

        if (this.options.showDelay)
            this.showTimeout = setTimeout(() => { this.show() }, this.options.showDelay);
        else
            this.show();
    }

    deactivate() {
        this.clearShowTimeout();

        if (this.options.hideDelay)
            this.hideTimeout = setTimeout(() => { this.hide() }, this.options.hideDelay);
        else
            this.hide();
    }

    clearShowTimeout() {
        if (this.showTimeout) {
            clearTimeout(this.showTimeout);
            this.showTimeout = null;
        }
    }

    clearHideTimeout() {
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
    }

    show() {
        if (!this.content) {
            return;
        }

        this.create();
        this.align();
        DomHandler.fadeIn(this.container, 250);
        this.container.style.zIndex = ++DomHandler.zindex;

        this.bindDocumentResizeListener();
    }

    hide() {
        this.remove();
    }

    create() {
        this.container = document.createElement('div');

        let tooltipArrow = document.createElement('div');
        tooltipArrow.className = 'p-tooltip-arrow';
        this.container.appendChild(tooltipArrow);

        this.tooltipText = document.createElement('div');
        this.tooltipText.className = 'p-tooltip-text';

        //todo: JSX support
        this.tooltipText.innerHTML = this.content;

        this.container.appendChild(this.tooltipText);
        document.body.appendChild(this.container);

        this.container.style.display = 'inline-block';
    }

    remove() {
        if (this.container && this.container.parentElement) {
            document.body.removeChild(this.container);
        }

        this.unbindDocumentResizeListener();
        this.container = null;
    }

    align() {
        switch (this.options.position) {
            case 'top':
                this.alignTop();
                if (this.isOutOfBounds()) {
                    this.alignBottom();
                }
                break;

            case 'bottom':
                this.alignBottom();
                if (this.isOutOfBounds()) {
                    this.alignTop();
                }
                break;

            case 'left':
                this.alignLeft();
                if (this.isOutOfBounds()) {
                    this.alignRight();

                    if (this.isOutOfBounds()) {
                        this.alignTop();

                        if (this.isOutOfBounds()) {
                            this.alignBottom();
                        }
                    }
                }
                break;

            case 'right':
                this.alignRight();
                if (this.isOutOfBounds()) {
                    this.alignLeft();

                    if (this.isOutOfBounds()) {
                        this.alignTop();

                        if (this.isOutOfBounds()) {
                            this.alignBottom();
                        }
                    }
                }
                break;

            default:
                throw new Error('Invalid position:' + this.options.position);
        }
    }

    getHostOffset() {
        let offset = this.target.getBoundingClientRect();
        let targetLeft = offset.left + DomHandler.getWindowScrollLeft();
        let targetTop = offset.top + DomHandler.getWindowScrollTop();
    
        return { left: targetLeft, top: targetTop };
    }

    alignRight() {
        this.preAlign('right');
        let hostOffset = this.getHostOffset();
        let left = hostOffset.left + DomHandler.getOuterWidth(this.target);
        let top = hostOffset.top + (DomHandler.getOuterHeight(this.target) - DomHandler.getOuterHeight(this.container)) / 2;
        this.container.style.left = left + 'px';
        this.container.style.top = top + 'px';
    }

    alignLeft() {
        this.preAlign('left');
        let hostOffset = this.getHostOffset();
        let left = hostOffset.left - DomHandler.getOuterWidth(this.container);
        let top = hostOffset.top + (DomHandler.getOuterHeight(this.target) - DomHandler.getOuterHeight(this.container)) / 2;
        this.container.style.left = left + 'px';
        this.container.style.top = top + 'px';
    }

    alignTop() {
        this.preAlign('top');
        let hostOffset = this.getHostOffset();
        let left = hostOffset.left + (DomHandler.getOuterWidth(this.target) - DomHandler.getOuterWidth(this.container)) / 2;
        let top = hostOffset.top - DomHandler.getOuterHeight(this.container);
        this.container.style.left = left + 'px';
        this.container.style.top = top + 'px';
    }

    alignBottom() {
        this.preAlign('bottom');
        let hostOffset = this.getHostOffset();
        let left = hostOffset.left + (DomHandler.getOuterWidth(this.target) - DomHandler.getOuterWidth(this.container)) / 2;
        let top = hostOffset.top + DomHandler.getOuterHeight(this.target);
        this.container.style.left = left + 'px';
        this.container.style.top = top + 'px';
    }

    preAlign(position) {
        this.container.style.left = -999 + 'px';
        this.container.style.top = -999 + 'px';

        let defaultClassName = 'p-tooltip p-component p-tooltip-' + position;
        this.container.className = this.tooltipStyleClass ? defaultClassName + ' ' + this.tooltipStyleClass : defaultClassName;
    }

    isOutOfBounds() {
        let offset = this.container.getBoundingClientRect();
        let targetTop = offset.top;
        let targetLeft = offset.left;
        let width = DomHandler.getOuterWidth(this.container);
        let height = DomHandler.getOuterHeight(this.container);
        let viewport = DomHandler.getViewport();

        return (targetLeft + width > viewport.width) || (targetLeft < 0) || (targetTop < 0) || (targetTop + height > viewport.height);
    }

    bindDocumentResizeListener() {
        this.resizeListener = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.resizeListener);
    }

    unbindDocumentResizeListener() {
        window.removeEventListener('resize', this.resizeListener);
        this.resizeListener = null;
    }

    onWindowResize() {
        this.hide();
    }

    destroy() {
        this.unbindEvents();
        this.target = null;
    }
 }

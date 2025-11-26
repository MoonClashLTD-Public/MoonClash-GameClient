/******************************************
 * @author kL <klk0@qq.com>
 * @date 2020/12/9
 * @doc         .
 * @end
 ******************************************/
const { ccclass, property, disallowMultiple, menu, executionOrder, requireComponent } = _decorator;
import { Node, Component, Enum, tween, _decorator, EventHandler, Tween, ScrollView, Prefab, Layout, Vec2, Size, NodePool, isValid, instantiate, Vec3, Widget, UITransform, CCFloat, CCBoolean, CCInteger } from 'cc';
import { DEV } from 'cc/env';
import ListItem from './ListItem';

enum TemplateType {
    NODE = 1,
    PREFAB = 2,
}

enum SlideType {
    NORMAL = 1,  
    ADHERING = 2,  
    PAGE = 3,  
}

enum SelectedType {
    NONE = 0,
    SINGLE = 1,  
    MULT = 2,  
}

@ccclass
@disallowMultiple()
@menu('ui/list/List')
@requireComponent(ScrollView)
  
@executionOrder(-5000)
export default class List extends Component {
      
    @property({ type: Enum(TemplateType), tooltip: DEV && '', })
    private templateType: TemplateType = TemplateType.NODE;
      
    @property({
        type: Node,
        tooltip: DEV && '',
        visible() { return this.templateType == TemplateType.NODE; }
    })
    tmpNode: Node = null;
      
    @property({
        type: Prefab,
        tooltip: DEV && '',
        visible() { return this.templateType == TemplateType.PREFAB; }
    })
    tmpPrefab: Prefab = null;
      
    @property({})
    private _slideMode: SlideType = SlideType.NORMAL;
    @property({
        type: Enum(SlideType),
        tooltip: DEV && ''
    })
    set slideMode(val: SlideType) {
        this._slideMode = val;
    }
    get slideMode() {
        return this._slideMode;
    }
      
    @property({
        type: CCFloat,
        range: [0, 1, .1],
        tooltip: DEV && '',
        slide: true,
        visible() { return this._slideMode == SlideType.PAGE; }
    })
    public pageDistance: number = .3;
      
    @property({
        type: EventHandler,
        tooltip: DEV && '',
        visible() { return this._slideMode == SlideType.PAGE; }
    })
    private pageChangeEvent: EventHandler = new EventHandler();
      
    @property({})
    private _virtual: boolean = true;
    @property({
        type: CCBoolean,
        tooltip: DEV && ''
    })
    set virtual(val: boolean) {
        if (val != null)
            this._virtual = val;
        if (!DEV && this._numItems != 0) {
            this._onScrolling();
        }
    }
    get virtual() {
        return this._virtual;
    }
      
    @property({
        tooltip: DEV && '',
        visible() {
            let val: boolean = /*this.virtual &&*/ this.slideMode == SlideType.NORMAL;
            if (!val)
                this.cyclic = false;
            return val;
        }
    })
    public cyclic: boolean = false;
      
    @property({
        tooltip: DEV && '',
        visible() { return this.virtual; }
    })
    public lackCenter: boolean = false;
      
    @property({
        tooltip: DEV && '',
        visible() {
            let val: boolean = this.virtual && !this.lackCenter;
            if (!val)
                this.lackSlide = false;
            return val;
        }
    })
    public lackSlide: boolean = false;
      
    @property({ type: CCInteger })
    private _updateRate: number = 0;
    @property({
        type: CCInteger,
        range: [0, 6, 1],
        tooltip: DEV && '',
        slide: true,
    })
    set updateRate(val: number) {
        if (val >= 0 && val <= 6) {
            this._updateRate = val;
        }
    }
    get updateRate() {
        return this._updateRate;
    }
      
    @property({
        type: CCInteger,
        range: [0, 12, 1],
        tooltip: DEV && '',
        slide: true,
    })
    public frameByFrameRenderNum: number = 0;
      
    @property({
        type: EventHandler,
        tooltip: DEV && '',
    })
    public renderEvent: EventHandler = new EventHandler();
      
    @property({
        type: Enum(SelectedType),
        tooltip: DEV && ''
    })
    public selectedMode: SelectedType = SelectedType.NONE;
      
    @property({
        type: EventHandler,
        tooltip: DEV && '',
        visible() { return this.selectedMode > SelectedType.NONE; }
    })
    public selectedEvent: EventHandler = new EventHandler();
    @property({
        tooltip: DEV && '',
        visible() { return this.selectedMode == SelectedType.SINGLE; }
    })
    public repeatEventSingle: boolean = false;

      
    private _selectedId: number = -1;
    private _lastSelectedId: number;
    private multSelected: number[];
    set selectedId(val: number) {
        let t: any = this;
        let item: any;
        switch (t.selectedMode) {
            case SelectedType.SINGLE: {
                if (!t.repeatEventSingle && val == t._selectedId)
                    return;
                item = t.getItemByListId(val);
                // if (!item && val >= 0)
                //     return;
                let listItem: ListItem;
                if (t._selectedId >= 0)
                    t._lastSelectedId = t._selectedId;
                else   
                    t._lastSelectedId = null;
                t._selectedId = val;
                if (item) {
                    listItem = item.getComponent(ListItem);
                    listItem.selected = true;
                }
                if (t._lastSelectedId >= 0 && t._lastSelectedId != t._selectedId) {
                    let lastItem: any = t.getItemByListId(t._lastSelectedId);
                    if (lastItem) {
                        lastItem.getComponent(ListItem).selected = false;
                    }
                }
                if (t.selectedEvent) {
                    EventHandler.emitEvents([t.selectedEvent], item, val % this._actualNumItems, t._lastSelectedId == null ? null : (t._lastSelectedId % this._actualNumItems));
                }
                break;
            }
            case SelectedType.MULT: {
                item = t.getItemByListId(val);
                if (!item)
                    return;
                let listItem = item.getComponent(ListItem);
                if (t._selectedId >= 0)
                    t._lastSelectedId = t._selectedId;
                t._selectedId = val;
                let bool: boolean = !listItem.selected;
                listItem.selected = bool;
                let sub: number = t.multSelected.indexOf(val);
                if (bool && sub < 0) {
                    t.multSelected.push(val);
                } else if (!bool && sub >= 0) {
                    t.multSelected.splice(sub, 1);
                }
                if (t.selectedEvent) {
                    EventHandler.emitEvents([t.selectedEvent], item, val % this._actualNumItems, t._lastSelectedId == null ? null : (t._lastSelectedId % this._actualNumItems), bool);
                }
                break;
            }
        }
    }
    get selectedId() {
        return this._selectedId;
    }
    private _forceUpdate: boolean = false;
    private _align: number;
    private _horizontalDir: number;
    private _verticalDir: number;
    private _startAxis: number;
    private _alignCalcType: number;
    public content: Node;
    private _contentUt: UITransform;
    private firstListId: number;
    public displayItemNum: number;
    private _updateDone: boolean = true;
    private _updateCounter: number;
    public _actualNumItems: number;
    private _cyclicNum: number;
    private _cyclicPos1: number;
    private _cyclicPos2: number;
      
    @property({
        serializable: false
    })
    private _numItems: number = 0;
    set numItems(val: number) {
        let t = this;
        if (!t.checkInited(false))
            return;
        if (val == null || val < 0) {
            console.error('numItems set the wrong::', val);
            return;
        }
        t._actualNumItems = t._numItems = val;
        t._forceUpdate = true;

        if (t._virtual) {
            t._resizeContent();
            if (t.cyclic) {
                t._numItems = t._cyclicNum * t._numItems;
            }
            t._onScrolling();
            if (!t.frameByFrameRenderNum && t.slideMode == SlideType.PAGE)
                t.curPageNum = t.nearestListId;
        } else {
            if (t.cyclic) {
                t._resizeContent();
                t._numItems = t._cyclicNum * t._numItems;
            }
            let layout: Layout = t.content.getComponent(Layout);
            if (layout) {
                layout.enabled = true;
            }
            t._delRedundantItem();

            t.firstListId = 0;
            if (t.frameByFrameRenderNum > 0) {
                  
                let len: number = t.frameByFrameRenderNum > t._numItems ? t._numItems : t.frameByFrameRenderNum;
                for (let n: number = 0; n < len; n++) {
                    t._createOrUpdateItem2(n);
                }
                if (t.frameByFrameRenderNum < t._numItems) {
                    t._updateCounter = t.frameByFrameRenderNum;
                    t._updateDone = false;
                }
            } else {
                for (let n: number = 0; n < t._numItems; n++) {
                    t._createOrUpdateItem2(n);
                }
                t.displayItemNum = t._numItems;
            }
        }
    }
    get numItems() {
        return this._actualNumItems;
    }

    private _inited: boolean = false;
    private _scrollView: ScrollView;
    get scrollView() {
        return this._scrollView;
    }
    private _layout: Layout;
    private _resizeMode: number;
    private _topGap: number;
    private _rightGap: number;
    private _bottomGap: number;
    private _leftGap: number;

    private _columnGap: number;
    private _lineGap: number;
    private _colLineNum: number;

    private _lastDisplayData: number[];
    public displayData: any[];
    private _pool: NodePool;

    private _itemTmp: any;
    private _itemTmpUt: UITransform;
    private _needUpdateWidget: boolean = false;
    private _itemSize: Size;
    private _sizeType: boolean;

    public _customSize: any;

    private frameCount: number;
    private _aniDelRuning: boolean = false;
    private _aniDelCB: Function;
    private _aniDelItem: any;
    private _aniDelBeforePos: Vec2;
    private _aniDelBeforeScale: number;
    private viewTop: number;
    private viewRight: number;
    private viewBottom: number;
    private viewLeft: number;

    private _doneAfterUpdate: boolean = false;

    private elasticTop: number;
    private elasticRight: number;
    private elasticBottom: number;
    private elasticLeft: number;

    private scrollToListId: number;

    private adhering: boolean = false;

    private _adheringBarrier: boolean = false;
    private nearestListId: number;

    public curPageNum: number = 0;
    private _beganPos: number;
    private _scrollPos: number;
    private _curScrollIsTouch: boolean;  

    private _scrollToListId: number;
    private _scrollToEndTime: number;
    private _scrollToSo: any;

    private _lack: boolean;
    private _allItemSize: number;
    private _allItemSizeNoEdge: number;

    private _scrollItem: any;  

    private _thisNodeUt: UITransform;

    //----------------------------------------------------------------------------

    onLoad() {
        this._init();
    }

    onDestroy() {
        let t: any = this;
        if (isValid(t._itemTmp))
            t._itemTmp.destroy();
        if (isValid(t.tmpNode))
            t.tmpNode.destroy();
        t._pool && t._pool.clear();
    }

    onEnable() {
        // if (!EDITOR) 
        this._registerEvent();
        this._init();
          
        if (this._aniDelRuning) {
            this._aniDelRuning = false;
            if (this._aniDelItem) {
                if (this._aniDelBeforePos) {
                    this._aniDelItem.position = this._aniDelBeforePos;
                    delete this._aniDelBeforePos;
                }
                if (this._aniDelBeforeScale) {
                    this._aniDelItem.scale = this._aniDelBeforeScale;
                    delete this._aniDelBeforeScale;
                }
                delete this._aniDelItem;
            }
            if (this._aniDelCB) {
                this._aniDelCB();
                delete this._aniDelCB;
            }
        }
    }

    onDisable() {
        // if (!EDITOR) 
        this._unregisterEvent();
    }
      
    _registerEvent() {
        let t: List = this;
        t.node.on(Node.EventType.TOUCH_START, t._onTouchStart, t);
        t.node.on('touch-up', t._onTouchUp, t);
        t.node.on(Node.EventType.TOUCH_CANCEL, t._onTouchCancelled, t);
        t.node.on('scroll-began', t._onScrollBegan, t);
        t.node.on('scroll-ended', t._onScrollEnded, t);
        t.node.on('scrolling', t._onScrolling, t);
        t.node.on(Node.EventType.SIZE_CHANGED, t._onSizeChanged, t);
    }
      
    _unregisterEvent() {
        let t: any = this;
        t.node.off(Node.EventType.TOUCH_START, t._onTouchStart, t);
        t.node.off('touch-up', t._onTouchUp, t);
        t.node.off(Node.EventType.TOUCH_CANCEL, t._onTouchCancelled, t);
        t.node.off('scroll-began', t._onScrollBegan, t);
        t.node.off('scroll-ended', t._onScrollEnded, t);
        t.node.off('scrolling', t._onScrolling, t);
        t.node.off(Node.EventType.SIZE_CHANGED, t._onSizeChanged, t);
    }
      
    _init() {
        let t: any = this;
        if (t._inited)
            return;

        t._thisNodeUt = t.node.getComponent(UITransform);
        t._scrollView = t.node.getComponent(ScrollView);

        t.content = t._scrollView.content;
        t._contentUt = t.content.getComponent(UITransform);
        if (!t.content) {
            console.error(t.node.name + "'s ScrollView unset content!");
            return;
        }

        t._layout = t.content.getComponent(Layout);

        t._align = t._layout.type;   
        t._resizeMode = t._layout.resizeMode;   
        t._startAxis = t._layout.startAxis;

        t._topGap = t._layout.paddingTop;   
        t._rightGap = t._layout.paddingRight;   
        t._bottomGap = t._layout.paddingBottom;   
        t._leftGap = t._layout.paddingLeft;   

        t._columnGap = t._layout.spacingX;   
        t._lineGap = t._layout.spacingY;   

        t._colLineNum;   

        t._verticalDir = t._layout.verticalDirection;   
        t._horizontalDir = t._layout.horizontalDirection;   

        t.setTemplateItem(instantiate(t.templateType == TemplateType.PREFAB ? t.tmpPrefab : t.tmpNode));

          
        if (t._slideMode == SlideType.ADHERING || t._slideMode == SlideType.PAGE) {
            t._scrollView.inertia = false;
            t._scrollView._onMouseWheel = function () {
                return;
            };
        }
        if (!t.virtual)           
            t.lackCenter = false;

        t._lastDisplayData = [];   
        t.displayData = [];   
        t._pool = new NodePool();      
        t._forceUpdate = false;           
        t._updateCounter = 0;             
        t._updateDone = true;             

        t.curPageNum = 0;                 

        if (t.cyclic || 0) {
            t._scrollView._processAutoScrolling = this._processAutoScrolling.bind(t);
            t._scrollView._startBounceBackIfNeeded = function () {
                return false;
            }
        }

        switch (t._align) {
            case Layout.Type.HORIZONTAL: {
                switch (t._horizontalDir) {
                    case Layout.HorizontalDirection.LEFT_TO_RIGHT:
                        t._alignCalcType = 1;
                        break;
                    case Layout.HorizontalDirection.RIGHT_TO_LEFT:
                        t._alignCalcType = 2;
                        break;
                }
                break;
            }
            case Layout.Type.VERTICAL: {
                switch (t._verticalDir) {
                    case Layout.VerticalDirection.TOP_TO_BOTTOM:
                        t._alignCalcType = 3;
                        break;
                    case Layout.VerticalDirection.BOTTOM_TO_TOP:
                        t._alignCalcType = 4;
                        break;
                }
                break;
            }
            case Layout.Type.GRID: {
                switch (t._startAxis) {
                    case Layout.AxisDirection.HORIZONTAL:
                        switch (t._verticalDir) {
                            case Layout.VerticalDirection.TOP_TO_BOTTOM:
                                t._alignCalcType = 3;
                                break;
                            case Layout.VerticalDirection.BOTTOM_TO_TOP:
                                t._alignCalcType = 4;
                                break;
                        }
                        break;
                    case Layout.AxisDirection.VERTICAL:
                        switch (t._horizontalDir) {
                            case Layout.HorizontalDirection.LEFT_TO_RIGHT:
                                t._alignCalcType = 1;
                                break;
                            case Layout.HorizontalDirection.RIGHT_TO_LEFT:
                                t._alignCalcType = 2;
                                break;
                        }
                        break;
                }
                break;
            }
        }
          
        // t.content.children.forEach((child: Node) => {
        //     child.removeFromParent();
        //     if (child != t.tmpNode && child.isValid)
        //         child.destroy();
        // });
        t.content.removeAllChildren();
        t._inited = true;
    }
    /**
     *                 ，        cc.ScrollView          
     * @param {Number} dt
     */
    _processAutoScrolling(dt: number) {

          
        const OUT_OF_BOUNDARY_BREAKING_FACTOR = 0.05;
        const EPSILON = 1e-4;
        const ZERO = new Vec3();
        const quintEaseOut = (time: number) => {
            time -= 1;
            return (time * time * time * time * time + 1);
        };
          

        let sv: ScrollView = this._scrollView;

        const isAutoScrollBrake = sv['_isNecessaryAutoScrollBrake']();
        const brakingFactor = isAutoScrollBrake ? OUT_OF_BOUNDARY_BREAKING_FACTOR : 1;
        sv['_autoScrollAccumulatedTime'] += dt * (1 / brakingFactor);

        let percentage = Math.min(1, sv['_autoScrollAccumulatedTime'] / sv['_autoScrollTotalTime']);
        if (sv['_autoScrollAttenuate']) {
            percentage = quintEaseOut(percentage);
        }

        const clonedAutoScrollTargetDelta = sv['_autoScrollTargetDelta'].clone();
        clonedAutoScrollTargetDelta.multiplyScalar(percentage);
        const clonedAutoScrollStartPosition = sv['_autoScrollStartPosition'].clone();
        clonedAutoScrollStartPosition.add(clonedAutoScrollTargetDelta);
        let reachedEnd = Math.abs(percentage - 1) <= EPSILON;

        const fireEvent = Math.abs(percentage - 1) <= sv['getScrollEndedEventTiming']();
        if (fireEvent && !sv['_isScrollEndedWithThresholdEventFired']) {
            sv['_dispatchEvent'](ScrollView.EventType.SCROLL_ENG_WITH_THRESHOLD);
            sv['_isScrollEndedWithThresholdEventFired'] = true;
        }

        if (sv['elastic']) {
            const brakeOffsetPosition = clonedAutoScrollStartPosition.clone();
            brakeOffsetPosition.subtract(sv['_autoScrollBrakingStartPosition']);
            if (isAutoScrollBrake) {
                brakeOffsetPosition.multiplyScalar(brakingFactor);
            }
            clonedAutoScrollStartPosition.set(sv['_autoScrollBrakingStartPosition']);
            clonedAutoScrollStartPosition.add(brakeOffsetPosition);
        } else {
            const moveDelta = clonedAutoScrollStartPosition.clone();
            moveDelta.subtract(sv['_getContentPosition']());
            const outOfBoundary = sv['_getHowMuchOutOfBoundary'](moveDelta);
            if (!outOfBoundary.equals(ZERO, EPSILON)) {
                clonedAutoScrollStartPosition.add(outOfBoundary);
                reachedEnd = true;
            }
        }

        if (reachedEnd) {
            sv['_autoScrolling'] = false;
        }

        const deltaMove = new Vec3(clonedAutoScrollStartPosition);
        deltaMove.subtract(sv['_getContentPosition']());
        sv['_clampDelta'](deltaMove);
        sv['_moveContent'](deltaMove, reachedEnd);
        sv['_dispatchEvent'](ScrollView.EventType.SCROLLING);

        if (!sv['_autoScrolling']) {
            sv['_isBouncing'] = false;
            sv['_scrolling'] = false;
            sv['_dispatchEvent'](ScrollView.EventType.SCROLL_ENDED);
        }
    }
      
    setTemplateItem(item: any) {
        if (!item)
            return;
        let t: any = this;
        t._itemTmp = item;
        t._itemTmpUt = item.getComponent(UITransform);

        if (t._resizeMode == Layout.ResizeMode.CHILDREN)
            t._itemSize = t._layout.cellSize;
        else {
            let itemUt: UITransform = item.getComponent(UITransform);
            t._itemSize = new Size(itemUt.width, itemUt.height);
        }

          
        let com: any = item.getComponent(ListItem);
        let remove = false;
        if (!com)
            remove = true;
        // if (com) {
        //     if (!com._btnCom && !item.getComponent(cc.Button)) {
        //         remove = true;
        //     }
        // }
        if (remove) {
            t.selectedMode = SelectedType.NONE;
        }
        com = item.getComponent(Widget);
        if (com && com.enabled) {
            t._needUpdateWidget = true;
        }
        if (t.selectedMode == SelectedType.MULT)
            t.multSelected = [];

        switch (t._align) {
            case Layout.Type.HORIZONTAL:
                t._colLineNum = 1;
                t._sizeType = false;
                break;
            case Layout.Type.VERTICAL:
                t._colLineNum = 1;
                t._sizeType = true;
                break;
            case Layout.Type.GRID:
                switch (t._startAxis) {
                    case Layout.AxisDirection.HORIZONTAL:
                          
                        let trimW: number = t._contentUt.width - t._leftGap - t._rightGap;
                        t._colLineNum = Math.floor((trimW + t._columnGap) / (t._itemSize.width + t._columnGap));
                        t._sizeType = true;
                        break;
                    case Layout.AxisDirection.VERTICAL:
                          
                        let trimH: number = t._contentUt.height - t._topGap - t._bottomGap;
                        t._colLineNum = Math.floor((trimH + t._lineGap) / (t._itemSize.height + t._lineGap));
                        t._sizeType = false;
                        break;
                }
                break;
        }
    }
    /**
     *               
     * @param {Boolean} printLog                 
     * @returns
     */
    checkInited(printLog: boolean = true) {
        if (!this._inited) {
            if (printLog)
                console.error('List initialization not completed!');
            return false;
        }
        return true;
    }
      
    _resizeContent() {
        let t: any = this;
        let result: number;

        switch (t._align) {
            case Layout.Type.HORIZONTAL: {
                if (t._customSize) {
                    let fixed: any = t._getFixedSize(null);
                    result = t._leftGap + fixed.val + (t._itemSize.width * (t._numItems - fixed.count)) + (t._columnGap * (t._numItems - 1)) + t._rightGap;
                } else {
                    result = t._leftGap + (t._itemSize.width * t._numItems) + (t._columnGap * (t._numItems - 1)) + t._rightGap;
                }
                break;
            }
            case Layout.Type.VERTICAL: {
                if (t._customSize) {
                    let fixed: any = t._getFixedSize(null);
                    result = t._topGap + fixed.val + (t._itemSize.height * (t._numItems - fixed.count)) + (t._lineGap * (t._numItems - 1)) + t._bottomGap;
                } else {
                    result = t._topGap + (t._itemSize.height * t._numItems) + (t._lineGap * (t._numItems - 1)) + t._bottomGap;
                }
                break;
            }
            case Layout.Type.GRID: {
                  
                if (t.lackCenter)
                    t.lackCenter = false;
                switch (t._startAxis) {
                    case Layout.AxisDirection.HORIZONTAL:
                        let lineNum: number = Math.ceil(t._numItems / t._colLineNum);
                        result = t._topGap + (t._itemSize.height * lineNum) + (t._lineGap * (lineNum - 1)) + t._bottomGap;
                        break;
                    case Layout.AxisDirection.VERTICAL:
                        let colNum: number = Math.ceil(t._numItems / t._colLineNum);
                        result = t._leftGap + (t._itemSize.width * colNum) + (t._columnGap * (colNum - 1)) + t._rightGap;
                        break;
                }
                break;
            }
        }

        let layout: Layout = t.content.getComponent(Layout);
        if (layout)
            layout.enabled = false;

        t._allItemSize = result;
        t._allItemSizeNoEdge = t._allItemSize - (t._sizeType ? (t._topGap + t._bottomGap) : (t._leftGap + t._rightGap));

        if (t.cyclic) {
            let totalSize: number = (t._sizeType ? t._thisNodeUt.height : t._thisNodeUt.width);

            t._cyclicPos1 = 0;
            totalSize -= t._cyclicPos1;
            t._cyclicNum = Math.ceil(totalSize / t._allItemSizeNoEdge) + 1;
            let spacing: number = t._sizeType ? t._lineGap : t._columnGap;
            t._cyclicPos2 = t._cyclicPos1 + t._allItemSizeNoEdge + spacing;
            t._cyclicAllItemSize = t._allItemSize + (t._allItemSizeNoEdge * (t._cyclicNum - 1)) + (spacing * (t._cyclicNum - 1));
            t._cycilcAllItemSizeNoEdge = t._allItemSizeNoEdge * t._cyclicNum;
            t._cycilcAllItemSizeNoEdge += spacing * (t._cyclicNum - 1);
            // cc.log('_cyclicNum ->', t._cyclicNum, t._allItemSizeNoEdge, t._allItemSize, t._cyclicPos1, t._cyclicPos2);
        }

        t._lack = !t.cyclic && t._allItemSize < (t._sizeType ? t._thisNodeUt.height : t._thisNodeUt.width);
        let slideOffset: number = ((!t._lack || !t.lackCenter) && t.lackSlide) ? 0 : .1;

        let targetWH: number = t._lack ? ((t._sizeType ? t._thisNodeUt.height : t._thisNodeUt.width) - slideOffset) : (t.cyclic ? t._cyclicAllItemSize : t._allItemSize);
        if (targetWH < 0)
            targetWH = 0;

        if (t._sizeType) {
            t._contentUt.height = targetWH;
        } else {
            t._contentUt.width = targetWH;
        }

        // cc.log('_resizeContent()  numItems =', t._numItems, '，content =', t.content);
    }

      
    _onScrolling(ev: Event = null) {
        if (this.frameCount == null)
            this.frameCount = this._updateRate;
        if (!this._forceUpdate && (ev && ev.type != 'scroll-ended') && this.frameCount > 0) {
            this.frameCount--;
            return;
        } else
            this.frameCount = this._updateRate;

        if (this._aniDelRuning)
            return;

          
        if (this.cyclic) {
            let scrollPos: any = this.content.getPosition();
            scrollPos = this._sizeType ? scrollPos.y : scrollPos.x;

            let addVal = this._allItemSizeNoEdge + (this._sizeType ? this._lineGap : this._columnGap);
            let add: any = this._sizeType ? new Vec3(0, addVal, 0) : new Vec3(addVal, 0, 0);

            let contentPos = this.content.getPosition();

            switch (this._alignCalcType) {
                case 1:  
                    if (scrollPos > -this._cyclicPos1) {
                        contentPos.set(-this._cyclicPos2, contentPos.y, contentPos.z);
                        this.content.setPosition(contentPos);
                        if (this._scrollView.isAutoScrolling()) {
                            this._scrollView['_autoScrollStartPosition'] = this._scrollView['_autoScrollStartPosition'].subtract(add);
                        }
                        // if (this._beganPos) {
                        //     this._beganPos += add;
                        // }
                    } else if (scrollPos < -this._cyclicPos2) {
                        contentPos.set(-this._cyclicPos1, contentPos.y, contentPos.z);
                        this.content.setPosition(contentPos);
                        if (this._scrollView.isAutoScrolling()) {
                            this._scrollView['_autoScrollStartPosition'] = this._scrollView['_autoScrollStartPosition'].add(add);
                        }
                        // if (this._beganPos) {
                        //     this._beganPos -= add;
                        // }
                    }
                    break;
                case 2:  
                    if (scrollPos < this._cyclicPos1) {
                        contentPos.set(this._cyclicPos2, contentPos.y, contentPos.z);
                        this.content.setPosition(contentPos);
                        if (this._scrollView.isAutoScrolling()) {
                            this._scrollView['_autoScrollStartPosition'] = this._scrollView['_autoScrollStartPosition'].add(add);
                        }
                    } else if (scrollPos > this._cyclicPos2) {
                        contentPos.set(this._cyclicPos1, contentPos.y, contentPos.z);
                        this.content.setPosition(contentPos);
                        if (this._scrollView.isAutoScrolling()) {
                            this._scrollView['_autoScrollStartPosition'] = this._scrollView['_autoScrollStartPosition'].subtract(add);
                        }
                    }
                    break;
                case 3:  
                    if (scrollPos < this._cyclicPos1) {
                        contentPos.set(contentPos.x, this._cyclicPos2, contentPos.z);
                        this.content.setPosition(contentPos);
                        if (this._scrollView.isAutoScrolling()) {
                            this._scrollView['_autoScrollStartPosition'] = this._scrollView['_autoScrollStartPosition'].add(add);
                        }
                    } else if (scrollPos > this._cyclicPos2) {
                        contentPos.set(contentPos.x, this._cyclicPos1, contentPos.z);
                        this.content.setPosition(contentPos);
                        if (this._scrollView.isAutoScrolling()) {
                            this._scrollView['_autoScrollStartPosition'] = this._scrollView['_autoScrollStartPosition'].subtract(add);
                        }
                    }
                    break;
                case 4:  
                    if (scrollPos > -this._cyclicPos1) {
                        contentPos.set(contentPos.x, -this._cyclicPos2, contentPos.z);
                        this.content.setPosition(contentPos);
                        if (this._scrollView.isAutoScrolling()) {
                            this._scrollView['_autoScrollStartPosition'] = this._scrollView['_autoScrollStartPosition'].subtract(add);
                        }
                    } else if (scrollPos < -this._cyclicPos2) {
                        contentPos.set(contentPos.x, -this._cyclicPos1, contentPos.z);
                        this.content.setPosition(contentPos);
                        if (this._scrollView.isAutoScrolling()) {
                            this._scrollView['_autoScrollStartPosition'] = this._scrollView['_autoScrollStartPosition'].add(add);
                        }
                    }
                    break;
            }
        }

        this._calcViewPos();

        let vTop: number, vRight: number, vBottom: number, vLeft: number;
        if (this._sizeType) {
            vTop = this.viewTop;
            vBottom = this.viewBottom;
        } else {
            vRight = this.viewRight;
            vLeft = this.viewLeft;
        }

        if (this._virtual) {
            this.displayData = [];
            let itemPos: any;

            let curId: number = 0;
            let endId: number = this._numItems - 1;

            if (this._customSize) {
                let breakFor: boolean = false;
                  
                for (; curId <= endId && !breakFor; curId++) {
                    itemPos = this._calcItemPos(curId);
                    switch (this._align) {
                        case Layout.Type.HORIZONTAL:
                            if (itemPos.right >= vLeft && itemPos.left <= vRight) {
                                this.displayData.push(itemPos);
                            } else if (curId != 0 && this.displayData.length > 0) {
                                breakFor = true;
                            }
                            break;
                        case Layout.Type.VERTICAL:
                            if (itemPos.bottom <= vTop && itemPos.top >= vBottom) {
                                this.displayData.push(itemPos);
                            } else if (curId != 0 && this.displayData.length > 0) {
                                breakFor = true;
                            }
                            break;
                        case Layout.Type.GRID:
                            switch (this._startAxis) {
                                case Layout.AxisDirection.HORIZONTAL:
                                    if (itemPos.bottom <= vTop && itemPos.top >= vBottom) {
                                        this.displayData.push(itemPos);
                                    } else if (curId != 0 && this.displayData.length > 0) {
                                        breakFor = true;
                                    }
                                    break;
                                case Layout.AxisDirection.VERTICAL:
                                    if (itemPos.right >= vLeft && itemPos.left <= vRight) {
                                        this.displayData.push(itemPos);
                                    } else if (curId != 0 && this.displayData.length > 0) {
                                        breakFor = true;
                                    }
                                    break;
                            }
                            break;
                    }
                }
            } else {
                let ww: number = this._itemSize.width + this._columnGap;
                let hh: number = this._itemSize.height + this._lineGap;
                switch (this._alignCalcType) {
                    case 1:  
                        curId = (vLeft - this._leftGap) / ww;
                        endId = (vRight - this._leftGap) / ww;
                        break;
                    case 2:  
                        curId = (-vRight - this._rightGap) / ww;
                        endId = (-vLeft - this._rightGap) / ww;
                        break;
                    case 3:  
                        curId = (-vTop - this._topGap) / hh;
                        endId = (-vBottom - this._topGap) / hh;
                        break;
                    case 4:  
                        curId = (vBottom - this._bottomGap) / hh;
                        endId = (vTop - this._bottomGap) / hh;
                        break;
                }
                curId = Math.floor(curId) * this._colLineNum;
                endId = Math.ceil(endId) * this._colLineNum;
                endId--;
                if (curId < 0)
                    curId = 0;
                if (endId >= this._numItems)
                    endId = this._numItems - 1;
                for (; curId <= endId; curId++) {
                    this.displayData.push(this._calcItemPos(curId));
                }
            }
            this._delRedundantItem();
            if (this.displayData.length <= 0 || !this._numItems) { //if none, delete all.
                this._lastDisplayData = [];
                return;
            }
            this.firstListId = this.displayData[0].id;
            this.displayItemNum = this.displayData.length;

            let len: number = this._lastDisplayData.length;

            let haveDataChange: boolean = this.displayItemNum != len;
            if (haveDataChange) {
                  
                if (this.frameByFrameRenderNum > 0) {
                    this._lastDisplayData.sort((a, b) => { return a - b });
                }
                  
                haveDataChange = this.firstListId != this._lastDisplayData[0] || this.displayData[this.displayItemNum - 1].id != this._lastDisplayData[len - 1];
            }

            if (this._forceUpdate || haveDataChange) {      
                if (this.frameByFrameRenderNum > 0) {
                    // if (this._updateDone) {
                    // this._lastDisplayData = [];
                      
                    if (this._numItems > 0) {
                        if (!this._updateDone) {
                            this._doneAfterUpdate = true;
                        } else {
                            this._updateCounter = 0;
                        }
                        this._updateDone = false;
                    } else {
                        this._updateCounter = 0;
                        this._updateDone = true;
                    }
                    // }
                } else {
                      
                    this._lastDisplayData = [];
                    // cc.log('List Display Data II::', this.displayData);
                    for (let c = 0; c < this.displayItemNum; c++) {
                        this._createOrUpdateItem(this.displayData[c]);
                    }
                    this._forceUpdate = false;
                }
            }
            this._calcNearestItem();
        }
    }
      
    _calcViewPos() {
        let scrollPos: any = this.content.getPosition();
        switch (this._alignCalcType) {
            case 1:  
                this.elasticLeft = scrollPos.x > 0 ? scrollPos.x : 0;
                this.viewLeft = (scrollPos.x < 0 ? -scrollPos.x : 0) - this.elasticLeft;

                this.viewRight = this.viewLeft + this._thisNodeUt.width;
                this.elasticRight = this.viewRight > this._contentUt.width ? Math.abs(this.viewRight - this._contentUt.width) : 0;
                this.viewRight += this.elasticRight;
                // cc.log(this.elasticLeft, this.elasticRight, this.viewLeft, this.viewRight);
                break;
            case 2:  
                this.elasticRight = scrollPos.x < 0 ? -scrollPos.x : 0;
                this.viewRight = (scrollPos.x > 0 ? -scrollPos.x : 0) + this.elasticRight;
                this.viewLeft = this.viewRight - this._thisNodeUt.width;
                this.elasticLeft = this.viewLeft < -this._contentUt.width ? Math.abs(this.viewLeft + this._contentUt.width) : 0;
                this.viewLeft -= this.elasticLeft;
                // cc.log(this.elasticLeft, this.elasticRight, this.viewLeft, this.viewRight);
                break;
            case 3:  
                this.elasticTop = scrollPos.y < 0 ? Math.abs(scrollPos.y) : 0;
                this.viewTop = (scrollPos.y > 0 ? -scrollPos.y : 0) + this.elasticTop;
                this.viewBottom = this.viewTop - this._thisNodeUt.height;
                this.elasticBottom = this.viewBottom < -this._contentUt.height ? Math.abs(this.viewBottom + this._contentUt.height) : 0;
                this.viewBottom += this.elasticBottom;
                // cc.log(this.elasticTop, this.elasticBottom, this.viewTop, this.viewBottom);
                break;
            case 4:  
                this.elasticBottom = scrollPos.y > 0 ? Math.abs(scrollPos.y) : 0;
                this.viewBottom = (scrollPos.y < 0 ? -scrollPos.y : 0) - this.elasticBottom;
                this.viewTop = this.viewBottom + this._thisNodeUt.height;
                this.elasticTop = this.viewTop > this._contentUt.height ? Math.abs(this.viewTop - this._contentUt.height) : 0;
                this.viewTop -= this.elasticTop;
                // cc.log(this.elasticTop, this.elasticBottom, this.viewTop, this.viewBottom);
                break;
        }
    }
      
    _calcItemPos(id: number) {
        let width: number, height: number, top: number, bottom: number, left: number, right: number, itemX: number, itemY: number;
        switch (this._align) {
            case Layout.Type.HORIZONTAL:
                switch (this._horizontalDir) {
                    case Layout.HorizontalDirection.LEFT_TO_RIGHT: {
                        if (this._customSize) {
                            let fixed: any = this._getFixedSize(id);
                            left = this._leftGap + ((this._itemSize.width + this._columnGap) * (id - fixed.count)) + (fixed.val + (this._columnGap * fixed.count));
                            let cs: number = this._customSize[id];
                            width = (cs > 0 ? cs : this._itemSize.width);
                        } else {
                            left = this._leftGap + ((this._itemSize.width + this._columnGap) * id);
                            width = this._itemSize.width;
                        }
                        if (this.lackCenter) {
                            left -= this._leftGap;
                            let offset: number = (this._contentUt.width / 2) - (this._allItemSizeNoEdge / 2);
                            left += offset;
                        }
                        right = left + width;
                        return {
                            id: id,
                            left: left,
                            right: right,
                            x: left + (this._itemTmpUt.anchorX * width),
                            y: this._itemTmp.y,
                        };
                    }
                    case Layout.HorizontalDirection.RIGHT_TO_LEFT: {
                        if (this._customSize) {
                            let fixed: any = this._getFixedSize(id);
                            right = -this._rightGap - ((this._itemSize.width + this._columnGap) * (id - fixed.count)) - (fixed.val + (this._columnGap * fixed.count));
                            let cs: number = this._customSize[id];
                            width = (cs > 0 ? cs : this._itemSize.width);
                        } else {
                            right = -this._rightGap - ((this._itemSize.width + this._columnGap) * id);
                            width = this._itemSize.width;
                        }
                        if (this.lackCenter) {
                            right += this._rightGap;
                            let offset: number = (this._contentUt.width / 2) - (this._allItemSizeNoEdge / 2);
                            right -= offset;
                        }
                        left = right - width;
                        return {
                            id: id,
                            right: right,
                            left: left,
                            x: left + (this._itemTmpUt.anchorX * width),
                            y: this._itemTmp.y,
                        };
                    }
                }
                break;
            case Layout.Type.VERTICAL: {
                switch (this._verticalDir) {
                    case Layout.VerticalDirection.TOP_TO_BOTTOM: {
                        if (this._customSize) {
                            let fixed: any = this._getFixedSize(id);
                            top = -this._topGap - ((this._itemSize.height + this._lineGap) * (id - fixed.count)) - (fixed.val + (this._lineGap * fixed.count));
                            let cs: number = this._customSize[id];
                            height = (cs > 0 ? cs : this._itemSize.height);
                        } else {
                            top = -this._topGap - ((this._itemSize.height + this._lineGap) * id);
                            height = this._itemSize.height;
                        }
                        if (this.lackCenter) {
                            top += this._topGap;
                            let offset: number = (this._contentUt.height / 2) - (this._allItemSizeNoEdge / 2);
                            top -= offset;
                        }
                        bottom = top - height;
                        return {
                            id: id,
                            top: top,
                            bottom: bottom,
                            x: this._itemTmp.x,
                            y: bottom + (this._itemTmpUt.anchorY * height),
                        };
                    }
                    case Layout.VerticalDirection.BOTTOM_TO_TOP: {
                        if (this._customSize) {
                            let fixed: any = this._getFixedSize(id);
                            bottom = this._bottomGap + ((this._itemSize.height + this._lineGap) * (id - fixed.count)) + (fixed.val + (this._lineGap * fixed.count));
                            let cs: number = this._customSize[id];
                            height = (cs > 0 ? cs : this._itemSize.height);
                        } else {
                            bottom = this._bottomGap + ((this._itemSize.height + this._lineGap) * id);
                            height = this._itemSize.height;
                        }
                        if (this.lackCenter) {
                            bottom -= this._bottomGap;
                            let offset: number = (this._contentUt.height / 2) - (this._allItemSizeNoEdge / 2);
                            bottom += offset;
                        }
                        top = bottom + height;
                        return {
                            id: id,
                            top: top,
                            bottom: bottom,
                            x: this._itemTmp.x,
                            y: bottom + (this._itemTmpUt.anchorY * height),
                        };
                        break;
                    }
                }
            }
            case Layout.Type.GRID: {
                let colLine: number = Math.floor(id / this._colLineNum);
                switch (this._startAxis) {
                    case Layout.AxisDirection.HORIZONTAL: {
                        switch (this._verticalDir) {
                            case Layout.VerticalDirection.TOP_TO_BOTTOM: {
                                top = -this._topGap - ((this._itemSize.height + this._lineGap) * colLine);
                                bottom = top - this._itemSize.height;
                                itemY = bottom + (this._itemTmpUt.anchorY * this._itemSize.height);
                                break;
                            }
                            case Layout.VerticalDirection.BOTTOM_TO_TOP: {
                                bottom = this._bottomGap + ((this._itemSize.height + this._lineGap) * colLine);
                                top = bottom + this._itemSize.height;
                                itemY = bottom + (this._itemTmpUt.anchorY * this._itemSize.height);
                                break;
                            }
                        }
                        itemX = this._leftGap + ((id % this._colLineNum) * (this._itemSize.width + this._columnGap));
                        switch (this._horizontalDir) {
                            case Layout.HorizontalDirection.LEFT_TO_RIGHT: {
                                itemX += (this._itemTmpUt.anchorX * this._itemSize.width);
                                itemX -= (this._contentUt.anchorX * this._contentUt.width);
                                break;
                            }
                            case Layout.HorizontalDirection.RIGHT_TO_LEFT: {
                                itemX += ((1 - this._itemTmpUt.anchorX) * this._itemSize.width);
                                itemX -= ((1 - this._contentUt.anchorX) * this._contentUt.width);
                                itemX *= -1;
                                break;
                            }
                        }
                        return {
                            id: id,
                            top: top,
                            bottom: bottom,
                            x: itemX,
                            y: itemY,
                        };
                    }
                    case Layout.AxisDirection.VERTICAL: {
                        switch (this._horizontalDir) {
                            case Layout.HorizontalDirection.LEFT_TO_RIGHT: {
                                left = this._leftGap + ((this._itemSize.width + this._columnGap) * colLine);
                                right = left + this._itemSize.width;
                                itemX = left + (this._itemTmpUt.anchorX * this._itemSize.width);
                                itemX -= (this._contentUt.anchorX * this._contentUt.width);
                                break;
                            }
                            case Layout.HorizontalDirection.RIGHT_TO_LEFT: {
                                right = -this._rightGap - ((this._itemSize.width + this._columnGap) * colLine);
                                left = right - this._itemSize.width;
                                itemX = left + (this._itemTmpUt.anchorX * this._itemSize.width);
                                itemX += ((1 - this._contentUt.anchorX) * this._contentUt.width);
                                break;
                            }
                        }
                        itemY = -this._topGap - ((id % this._colLineNum) * (this._itemSize.height + this._lineGap));
                        switch (this._verticalDir) {
                            case Layout.VerticalDirection.TOP_TO_BOTTOM: {
                                itemY -= ((1 - this._itemTmpUt.anchorY) * this._itemSize.height);
                                itemY += ((1 - this._contentUt.anchorY) * this._contentUt.height);
                                break;
                            }
                            case Layout.VerticalDirection.BOTTOM_TO_TOP: {
                                itemY -= ((this._itemTmpUt.anchorY) * this._itemSize.height);
                                itemY += (this._contentUt.anchorY * this._contentUt.height);
                                itemY *= -1;
                                break;
                            }
                        }
                        return {
                            id: id,
                            left: left,
                            right: right,
                            x: itemX,
                            y: itemY,
                        };
                    }
                }
                break;
            }
        }
    }
      
    _calcExistItemPos(id: number) {
        let item: any = this.getItemByListId(id);
        if (!item)
            return null;
        let ut: UITransform = item.getComponent(UITransform);
        let pos: Vec3 = item.getPosition();
        let data: any = {
            id: id,
            x: pos.x,
            y: pos.y,
        }
        if (this._sizeType) {
            data.top = pos.y + (ut.height * (1 - ut.anchorY));
            data.bottom = pos.y - (ut.height * ut.anchorY);
        } else {
            data.left = pos.x - (ut.width * ut.anchorX);
            data.right = pos.x + (ut.width * (1 - ut.anchorX));
        }
        return data;
    }
      
    getItemPos(id: number) {
        if (this._virtual)
            return this._calcItemPos(id);
        else {
            if (this.frameByFrameRenderNum)
                return this._calcItemPos(id);
            else
                return this._calcExistItemPos(id);
        }
    }
      
    _getFixedSize(listId: number) {
        if (!this._customSize)
            return null;
        if (listId == null)
            listId = this._numItems;
        let fixed: number = 0;
        let count: number = 0;
        for (let id in this._customSize) {
            if (parseInt(id) < listId) {
                fixed += this._customSize[id];
                count++;
            }
        }
        return {
            val: fixed,
            count: count,
        }
    }
      
    _onScrollBegan() {
        this._beganPos = this._sizeType ? this.viewTop : this.viewLeft;
    }
      
    _onScrollEnded() {
        let t: any = this;
        t._curScrollIsTouch = false;
        if (t.scrollToListId != null) {
            let item: any = t.getItemByListId(t.scrollToListId);
            t.scrollToListId = null;
            if (item) {
                tween(item)
                    .to(.1, { scale: 1.06 })
                    .to(.1, { scale: 1 })
                    .start();
            }
        }
        t._onScrolling();

        if (t._slideMode == SlideType.ADHERING &&
            !t.adhering
        ) {
            //cc.log(t.adhering, t._scrollView.isAutoScrolling(), t._scrollView.isScrolling());
            t.adhere();
        } else if (t._slideMode == SlideType.PAGE) {
            if (t._beganPos != null && t._curScrollIsTouch) {
                this._pageAdhere();
            } else {
                t.adhere();
            }
        }
    }
      
    _onTouchStart(ev, captureListeners) {
        if (this._scrollView['_hasNestedViewGroup'](ev, captureListeners))
            return;
        this._curScrollIsTouch = true;
        let isMe = ev.eventPhase === Event.AT_TARGET && ev.target === this.node;
        if (!isMe) {
            let itemNode: any = ev.target;
            while (itemNode._listId == null && itemNode.parent)
                itemNode = itemNode.parent;
            this._scrollItem = itemNode._listId != null ? itemNode : ev.target;
        }
    }
      
    _onTouchUp() {
        let t: any = this;
        t._scrollPos = null;
        if (t._slideMode == SlideType.ADHERING) {
            if (this.adhering)
                this._adheringBarrier = true;
            t.adhere();
        } else if (t._slideMode == SlideType.PAGE) {
            if (t._beganPos != null) {
                this._pageAdhere();
            } else {
                t.adhere();
            }
        }
        this._scrollItem = null;
    }

    _onTouchCancelled(ev, captureListeners) {
        let t = this;
        if (t._scrollView['_hasNestedViewGroup'](ev, captureListeners) || ev.simulate)
            return;

        t._scrollPos = null;
        if (t._slideMode == SlideType.ADHERING) {
            if (t.adhering)
                t._adheringBarrier = true;
            t.adhere();
        } else if (t._slideMode == SlideType.PAGE) {
            if (t._beganPos != null) {
                t._pageAdhere();
            } else {
                t.adhere();
            }
        }
        this._scrollItem = null;
    }
      
    _onSizeChanged() {
        if (this.checkInited(false))
            this._onScrolling();
    }
      
    _onItemAdaptive(item: any) {
        let ut: UITransform = item.getComponent(UITransform);
        // if (this.checkInited(false)) {
        if (
            (!this._sizeType && ut.width != this._itemSize.width)
            || (this._sizeType && ut.height != this._itemSize.height)
        ) {
            if (!this._customSize)
                this._customSize = {};
            let val = this._sizeType ? ut.height : ut.width;
            if (this._customSize[item._listId] != val) {
                this._customSize[item._listId] = val;
                this._resizeContent();
                // this.content.children.forEach((child: Node) => {
                //     this._updateItemPos(child);
                // });
                this.updateAll();
                  
                if (this._scrollToListId != null) {
                    this._scrollPos = null;
                    this.unschedule(this._scrollToSo);
                    this.scrollTo(this._scrollToListId, Math.max(0, this._scrollToEndTime - ((new Date()).getTime() / 1000)));
                }
            }
        }
        // }
    }
      
    _pageAdhere() {
        let t = this;
        if (!t.cyclic && (t.elasticTop > 0 || t.elasticRight > 0 || t.elasticBottom > 0 || t.elasticLeft > 0))
            return;
        let curPos = t._sizeType ? t.viewTop : t.viewLeft;
        let dis = (t._sizeType ? t._thisNodeUt.height : t._thisNodeUt.width) * t.pageDistance;
        let canSkip = Math.abs(t._beganPos - curPos) > dis;
        if (canSkip) {
            let timeInSecond = .5;
            switch (t._alignCalcType) {
                case 1:  
                case 4:  
                    if (t._beganPos > curPos) {
                        t.prePage(timeInSecond);
                        // cc.log('_pageAdhere   PPPPPPPPPPPPPPP');
                    } else {
                        t.nextPage(timeInSecond);
                        // cc.log('_pageAdhere   NNNNNNNNNNNNNNN');
                    }
                    break;
                case 2:  
                case 3:  
                    if (t._beganPos < curPos) {
                        t.prePage(timeInSecond);
                    } else {
                        t.nextPage(timeInSecond);
                    }
                    break;
            }
        } else if (t.elasticTop <= 0 && t.elasticRight <= 0 && t.elasticBottom <= 0 && t.elasticLeft <= 0) {
            t.adhere();
        }
        t._beganPos = null;
    }
      
    adhere() {
        let t: any = this;
        if (!t.checkInited())
            return;
        if (t.elasticTop > 0 || t.elasticRight > 0 || t.elasticBottom > 0 || t.elasticLeft > 0)
            return;
        t.adhering = true;
        t._calcNearestItem();
        let offset: number = (t._sizeType ? t._topGap : t._leftGap) / (t._sizeType ? t._thisNodeUt.height : t._thisNodeUt.width);
        let timeInSecond: number = .7;
        t.scrollTo(t.nearestListId, timeInSecond, offset);
    }
    //Update..
    update() {
        if (this.frameByFrameRenderNum <= 0 || this._updateDone)
            return;
        // cc.log(this.displayData.length, this._updateCounter, this.displayData[this._updateCounter]);
        if (this._virtual) {
            let len: number = (this._updateCounter + this.frameByFrameRenderNum) > this.displayItemNum ? this.displayItemNum : (this._updateCounter + this.frameByFrameRenderNum);
            for (let n: number = this._updateCounter; n < len; n++) {
                let data: any = this.displayData[n];
                if (data) {
                    this._createOrUpdateItem(data);
                }
            }

            if (this._updateCounter >= this.displayItemNum - 1) {   
                if (this._doneAfterUpdate) {
                    this._updateCounter = 0;
                    this._updateDone = false;
                    // if (!this._scrollView.isScrolling())
                    this._doneAfterUpdate = false;
                } else {
                    this._updateDone = true;
                    this._delRedundantItem();
                    this._forceUpdate = false;
                    this._calcNearestItem();
                    if (this.slideMode == SlideType.PAGE)
                        this.curPageNum = this.nearestListId;
                }
            } else {
                this._updateCounter += this.frameByFrameRenderNum;
            }
        } else {
            if (this._updateCounter < this._numItems) {
                let len: number = (this._updateCounter + this.frameByFrameRenderNum) > this._numItems ? this._numItems : (this._updateCounter + this.frameByFrameRenderNum);
                for (let n: number = this._updateCounter; n < len; n++) {
                    this._createOrUpdateItem2(n);
                }
                this._updateCounter += this.frameByFrameRenderNum;
            } else {
                this._updateDone = true;
                this._calcNearestItem();
                if (this.slideMode == SlideType.PAGE)
                    this.curPageNum = this.nearestListId;
            }
        }
    }
    /**
     *           Item（          ）
     * @param {Object} data     
     */
    _createOrUpdateItem(data: any) {
        let item: any = this.getItemByListId(data.id);
        if (!item) {   
            let canGet: boolean = this._pool.size() > 0;
            if (canGet) {
                item = this._pool.get();
                  
            } else {
                item = instantiate(this._itemTmp);
                  
            }
            if (!canGet || !isValid(item)) {
                item = instantiate(this._itemTmp);
                canGet = false;
            }
            if (item._listId != data.id) {
                item._listId = data.id;
                let ut: UITransform = item.getComponent(UITransform);
                ut.setContentSize(this._itemSize);
            }
            item.setPosition(new Vec3(data.x, data.y, 0));
            this._resetItemSize(item);
            this.content.addChild(item);
            if (canGet && this._needUpdateWidget) {
                let widget: Widget = item.getComponent(Widget);
                if (widget)
                    widget.updateAlignment();
            }
            item.setSiblingIndex(this.content.children.length - 1);

            let listItem: ListItem = item.getComponent(ListItem);
            item['listItem'] = listItem;
            if (listItem) {
                listItem.listId = data.id;
                listItem.list = this;
                listItem._registerEvent();
            }
            if (this.renderEvent) {
                EventHandler.emitEvents([this.renderEvent], item, data.id % this._actualNumItems);
            }
        } else if (this._forceUpdate && this.renderEvent) {   
            item.setPosition(new Vec3(data.x, data.y, 0));
            this._resetItemSize(item);
            // cc.log('ADD::', data.id, item);
            if (this.renderEvent) {
                EventHandler.emitEvents([this.renderEvent], item, data.id % this._actualNumItems);
            }
        }
        this._resetItemSize(item);

        this._updateListItem(item['listItem']);
        if (this._lastDisplayData.indexOf(data.id) < 0) {
            this._lastDisplayData.push(data.id);
        }
    }
      
    _createOrUpdateItem2(listId: number) {
        let item: any = this.content.children[listId];
        let listItem: ListItem;
        if (!item) {   
            item = instantiate(this._itemTmp);
            item._listId = listId;
            this.content.addChild(item);
            listItem = item.getComponent(ListItem);
            item['listItem'] = listItem;
            if (listItem) {
                listItem.listId = listId;
                listItem.list = this;
                listItem._registerEvent();
            }
            if (this.renderEvent) {
                EventHandler.emitEvents([this.renderEvent], item, listId % this._actualNumItems);
            }
        } else if (this._forceUpdate && this.renderEvent) {   
            item._listId = listId;
            if (listItem)
                listItem.listId = listId;
            if (this.renderEvent) {
                EventHandler.emitEvents([this.renderEvent], item, listId % this._actualNumItems);
            }
        }
        this._updateListItem(listItem);
        if (this._lastDisplayData.indexOf(listId) < 0) {
            this._lastDisplayData.push(listId);
        }
    }

    _updateListItem(listItem: ListItem) {
        if (!listItem)
            return;
        if (this.selectedMode > SelectedType.NONE) {
            let item: any = listItem.node;
            switch (this.selectedMode) {
                case SelectedType.SINGLE:
                    listItem.selected = this.selectedId == item._listId;
                    break;
                case SelectedType.MULT:
                    listItem.selected = this.multSelected.indexOf(item._listId) >= 0;
                    break;
            }
        }
    }
      
    _resetItemSize(item: any) {
        return;
        let size: number;
        let ut: UITransform = item.getComponent(UITransform);
        if (this._customSize && this._customSize[item._listId]) {
            size = this._customSize[item._listId];
        } else {
            if (this._colLineNum > 1)
                ut.setContentSize(this._itemSize);
            else
                size = this._sizeType ? this._itemSize.height : this._itemSize.width;
        }
        if (size) {
            if (this._sizeType)
                ut.height = size;
            else
                ut.width = size;
        }
    }
    /**
     *     Item    
     * @param {Number||Node} listIdOrItem
     */
    _updateItemPos(listIdOrItem: any) {
        let item: any = isNaN(listIdOrItem) ? listIdOrItem : this.getItemByListId(listIdOrItem);
        let pos: any = this.getItemPos(item._listId);
        item.setPosition(pos.x, pos.y);
    }
    /**
     *         
     * @param {Array} args           listId，        listId    
     * @param {Boolean} bool   ，      null    ，        args    
     */
    setMultSelected(args: any, bool: boolean) {
        let t: any = this;
        if (!t.checkInited())
            return;
        if (!Array.isArray(args)) {
            args = [args];
        }
        if (bool == null) {
            t.multSelected = args;
        } else {
            let listId: number, sub: number;
            if (bool) {
                for (let n: number = args.length - 1; n >= 0; n--) {
                    listId = args[n];
                    sub = t.multSelected.indexOf(listId);
                    if (sub < 0) {
                        t.multSelected.push(listId);
                    }
                }
            } else {
                for (let n: number = args.length - 1; n >= 0; n--) {
                    listId = args[n];
                    sub = t.multSelected.indexOf(listId);
                    if (sub >= 0) {
                        t.multSelected.splice(sub, 1);
                    }
                }
            }
        }
        t._forceUpdate = true;
        t._onScrolling();
    }
    /**
     *             
     * @returns
     */
    getMultSelected() {
        return this.multSelected;
    }
    /**
     *               
     * @param {number} listId     
     * @returns
     */
    hasMultSelected(listId: number) {
        return this.multSelected && this.multSelected.indexOf(listId) >= 0;
    }
    /**
     *           Item
     * @param {Array} args     listId，        
     * @returns
     */
    updateItem(args: any) {
        if (!this.checkInited())
            return;
        if (!Array.isArray(args)) {
            args = [args];
        }
        for (let n: number = 0, len: number = args.length; n < len; n++) {
            let listId: number = args[n];
            let item: any = this.getItemByListId(listId);
            if (item)
                EventHandler.emitEvents([this.renderEvent], item, listId % this._actualNumItems);
        }
    }
    /**
     *         
     */
    updateAll() {
        if (!this.checkInited())
            return;
        this.numItems = this.numItems;
    }
    /**
     *     ListID    Item
     * @param {Number} listId
     * @returns
     */
    getItemByListId(listId: number) {
        if (this.content) {
            for (let n: number = this.content.children.length - 1; n >= 0; n--) {
                let item: any = this.content.children[n];
                if (item._listId == listId)
                    return item;
            }
        }
    }
    /**
     *                   Item
     * @returns
     */
    _getOutsideItem() {
        let item: any;
        let result: any[] = [];
        for (let n: number = this.content.children.length - 1; n >= 0; n--) {
            item = this.content.children[n];
            if (!this.displayData.find(d => d.id == item._listId)) {
                result.push(item);
            }
        }
        return result;
    }
      
    _delRedundantItem() {
        if (this._virtual) {
            let arr: any[] = this._getOutsideItem();
            for (let n: number = arr.length - 1; n >= 0; n--) {
                let item: any = arr[n];
                if (this._scrollItem && item._listId == this._scrollItem._listId)
                    continue;
                item.isCached = true;
                this._pool.put(item);
                for (let m: number = this._lastDisplayData.length - 1; m >= 0; m--) {
                    if (this._lastDisplayData[m] == item._listId) {
                        this._lastDisplayData.splice(m, 1);
                        break;
                    }
                }
            }
              
        } else {
            while (this.content.children.length > this._numItems) {
                this._delSingleItem(this.content.children[this.content.children.length - 1]);
            }
        }
    }
      
    _delSingleItem(item: any) {
        // cc.log('DEL::', item['_listId'], item);
        item.removeFromParent();
        if (item.destroy)
            item.destroy();
        item = null;
    }
    /** 
     *         Item（                      ，  _virtual=true）
     *                               numItems        ，      List              。
     */
    aniDelItem(listId: number, callFunc: Function, aniType: number) {
        let t: any = this;

        if (!t.checkInited() || t.cyclic || !t._virtual)
            return console.error('This function is not allowed to be called!');

        if (!callFunc)
            return console.error('CallFunc are not allowed to be NULL, You need to delete the corresponding index in the data array in the CallFunc!');

        if (t._aniDelRuning)
            return console.warn('Please wait for the current deletion to finish!');

        let item: any = t.getItemByListId(listId);
        let listItem: ListItem;
        if (!item) {
            callFunc(listId);
            return;
        } else {
            listItem = item.getComponent(ListItem);
        }
        t._aniDelRuning = true;
        t._aniDelCB = callFunc;
        t._aniDelItem = item;
        t._aniDelBeforePos = item.position;
        t._aniDelBeforeScale = item.scale;
        let curLastId: number = t.displayData[t.displayData.length - 1].id;
        let resetSelectedId: boolean = listItem.selected;
        listItem.showAni(aniType, () => {
              
            let newId: number;
            if (curLastId < t._numItems - 2) {
                newId = curLastId + 1;
            }
            if (newId != null) {
                let newData: any = t._calcItemPos(newId);
                t.displayData.push(newData);
                if (t._virtual)
                    t._createOrUpdateItem(newData);
                else
                    t._createOrUpdateItem2(newId);
            } else
                t._numItems--;
            if (t.selectedMode == SelectedType.SINGLE) {
                if (resetSelectedId) {
                    t._selectedId = -1;
                } else if (t._selectedId - 1 >= 0) {
                    t._selectedId--;
                }
            } else if (t.selectedMode == SelectedType.MULT && t.multSelected.length) {
                let sub: number = t.multSelected.indexOf(listId);
                if (sub >= 0) {
                    t.multSelected.splice(sub, 1);
                }
                  
                for (let n: number = t.multSelected.length - 1; n >= 0; n--) {
                    let id: number = t.multSelected[n];
                    if (id >= listId)
                        t.multSelected[n]--;
                }
            }
            if (t._customSize) {
                if (t._customSize[listId])
                    delete t._customSize[listId];
                let newCustomSize: any = {};
                let size: number;
                for (let id in t._customSize) {
                    size = t._customSize[id];
                    let idNumber: number = parseInt(id);
                    newCustomSize[idNumber - (idNumber >= listId ? 1 : 0)] = size;
                }
                t._customSize = newCustomSize;
            }
              
            let sec: number = .2333;
            let twe: Tween<Node>, haveCB: boolean;
            for (let n: number = newId != null ? newId : curLastId; n >= listId + 1; n--) {
                item = t.getItemByListId(n);
                if (item) {
                    let posData: any = t._calcItemPos(n - 1);
                    twe = tween(item)
                        .to(sec, { position: new Vec3(posData.x, posData.y, 0) });

                    if (n <= listId + 1) {
                        haveCB = true;
                        twe.call(() => {
                            t._aniDelRuning = false;
                            callFunc(listId);
                            delete t._aniDelCB;
                        });
                    }
                    twe.start();
                }
            }
            if (!haveCB) {
                t._aniDelRuning = false;
                callFunc(listId);
                t._aniDelCB = null;
            }
        }, true);
    }
    /**
     *       ..
     * @param {Number} listId     （    <0，          Item    ，    >=_numItems，          Item    ）
     * @param {Number} timeInSecond     
     * @param {Number} offset                 ，0-1
     * @param {Boolean} overStress                 Item（                ）
     */
    scrollTo(listId: number, timeInSecond: number = .5, offset: number = null, overStress: boolean = false) {
        let t = this;
        if (!t.checkInited(false))
            return;
        // t._scrollView.stopAutoScroll();
        if (timeInSecond == null)     
            timeInSecond = .5;
        else if (timeInSecond < 0)
            timeInSecond = 0;
        if (listId < 0)
            listId = 0;
        else if (listId >= t._numItems)
            listId = t._numItems - 1;
          
        if (!t._virtual && t._layout && t._layout.enabled)
            t._layout.updateLayout();

        let pos = t.getItemPos(listId);
        if (!pos) {
            return DEV && console.error('pos is null', listId);
        }
        let targetX: number, targetY: number;

        switch (t._alignCalcType) {
            case 1:  
                targetX = pos.left;
                if (offset != null)
                    targetX -= t._thisNodeUt.width * offset;
                else
                    targetX -= t._leftGap;
                pos = new Vec3(targetX, 0, 0);
                break;
            case 2:  
                targetX = pos.right - t._thisNodeUt.width;
                if (offset != null)
                    targetX += t._thisNodeUt.width * offset;
                else
                    targetX += t._rightGap;
                pos = new Vec3(targetX + t._contentUt.width, 0, 0);
                break;
            case 3:  
                targetY = pos.top;
                if (offset != null)
                    targetY += t._thisNodeUt.height * offset;
                else
                    targetY += t._topGap;
                pos = new Vec3(0, -targetY, 0);
                break;
            case 4:  
                targetY = pos.bottom + t._thisNodeUt.height;
                if (offset != null)
                    targetY -= t._thisNodeUt.height * offset;
                else
                    targetY -= t._bottomGap;
                pos = new Vec3(0, -targetY + t._contentUt.height, 0);
                break;
        }
        let viewPos: any = t.content.getPosition();
        viewPos = Math.abs(t._sizeType ? viewPos.y : viewPos.x);

        let comparePos = t._sizeType ? pos.y : pos.x;
        let runScroll = Math.abs((t._scrollPos != null ? t._scrollPos : viewPos) - comparePos) > .5;
        // cc.log(runScroll, t._scrollPos, viewPos, comparePos)

        // t._scrollView.stopAutoScroll();
        if (runScroll) {
            t._scrollView.scrollToOffset(pos, timeInSecond);
            t._scrollToListId = listId;
            t._scrollToEndTime = ((new Date()).getTime() / 1000) + timeInSecond;
            // cc.log(listId, t.content.width, t.content.getPosition(), pos);
            t._scrollToSo = t.scheduleOnce(() => {
                if (!t._adheringBarrier) {
                    t.adhering = t._adheringBarrier = false;
                }
                t._scrollPos =
                    t._scrollToListId =
                    t._scrollToEndTime =
                    t._scrollToSo =
                    null;
                //cc.log('2222222222', t._adheringBarrier)
                if (overStress) {
                    // t.scrollToListId = listId;
                    let item = t.getItemByListId(listId);
                    if (item) {
                        tween(item)
                            .to(.1, { scale: 1.05 })
                            .to(.1, { scale: 1 })
                            .start();
                    }
                }
            }, timeInSecond + .1);

            if (timeInSecond <= 0) {
                t._onScrolling();
            }
        }
    }
    /**
     *                     Item
     */
    _calcNearestItem() {
        let t: any = this;
        t.nearestListId = null;
        let data: any, center: number;

        if (t._virtual)
            t._calcViewPos();

        let vTop: number, vRight: number, vBottom: number, vLeft: number;
        vTop = t.viewTop;
        vRight = t.viewRight;
        vBottom = t.viewBottom;
        vLeft = t.viewLeft;

        let breakFor: boolean = false;
        for (let n = 0; n < t.content.children.length && !breakFor; n += t._colLineNum) {
            data = t._virtual ? t.displayData[n] : t._calcExistItemPos(n);
            if (data) {
                center = t._sizeType ? ((data.top + data.bottom) / 2) : (center = (data.left + data.right) / 2);
                switch (t._alignCalcType) {
                    case 1:  
                        if (data.right >= vLeft) {
                            t.nearestListId = data.id;
                            if (vLeft > center)
                                t.nearestListId += t._colLineNum;
                            breakFor = true;
                        }
                        break;
                    case 2:  
                        if (data.left <= vRight) {
                            t.nearestListId = data.id;
                            if (vRight < center)
                                t.nearestListId += t._colLineNum;
                            breakFor = true;
                        }
                        break;
                    case 3:  
                        if (data.bottom <= vTop) {
                            t.nearestListId = data.id;
                            if (vTop < center)
                                t.nearestListId += t._colLineNum;
                            breakFor = true;
                        }
                        break;
                    case 4:  
                        if (data.top >= vBottom) {
                            t.nearestListId = data.id;
                            if (vBottom > center)
                                t.nearestListId += t._colLineNum;
                            breakFor = true;
                        }
                        break;
                }
            }
        }
          
        data = t._virtual ? t.displayData[t.displayItemNum - 1] : t._calcExistItemPos(t._numItems - 1);
        if (data && data.id == t._numItems - 1) {
            center = t._sizeType ? ((data.top + data.bottom) / 2) : (center = (data.left + data.right) / 2);
            switch (t._alignCalcType) {
                case 1:  
                    if (vRight > center)
                        t.nearestListId = data.id;
                    break;
                case 2:  
                    if (vLeft < center)
                        t.nearestListId = data.id;
                    break;
                case 3:  
                    if (vBottom < center)
                        t.nearestListId = data.id;
                    break;
                case 4:  
                    if (vTop > center)
                        t.nearestListId = data.id;
                    break;
            }
        }
        // cc.log('t.nearestListId =', t.nearestListId);
    }
      
    prePage(timeInSecond: number = .5) {
        // cc.log('👈');
        if (!this.checkInited())
            return;
        this.skipPage(this.curPageNum - 1, timeInSecond);
    }
      
    nextPage(timeInSecond: number = .5) {
        // cc.log('👉');
        if (!this.checkInited())
            return;
        this.skipPage(this.curPageNum + 1, timeInSecond);
    }
      
    skipPage(pageNum: number, timeInSecond: number) {
        let t: List = this;
        if (!t.checkInited())
            return;
        if (t._slideMode != SlideType.PAGE)
            return console.error('This function is not allowed to be called, Must SlideMode = PAGE!');
        if (pageNum < 0 || pageNum >= t._numItems)
            return;
        if (t.curPageNum == pageNum)
            return;
        // cc.log(pageNum);
        t.curPageNum = pageNum;
        t.node.off('scroll-ended', this.pageChangeEventEnd, t);
        t.node.once('scroll-ended', this.pageChangeEventEnd, t);
        t.scrollTo(pageNum, timeInSecond);
    }

    pageChangeEventEnd() {
        let t: List = this;
        if (t.pageChangeEvent) {
            EventHandler.emitEvents([t.pageChangeEvent], t.curPageNum);
        }
    }

      
    calcCustomSize(numItems: number) {
        let t: any = this;
        if (!t.checkInited())
            return;
        if (!t._itemTmp)
            return console.error('Unset template item!');
        if (!t.renderEvent)
            return console.error('Unset Render-Event!');
        t._customSize = {};
        let temp: any = instantiate(t._itemTmp);
        let ut: UITransform = temp.getComponent(UITransform);
        t.content.addChild(temp);
        for (let n: number = 0; n < numItems; n++) {
            EventHandler.emitEvents([t.renderEvent], temp, n);
            if (ut.height != t._itemSize.height || ut.width != t._itemSize.width) {
                t._customSize[n] = t._sizeType ? ut.height : ut.width;
            }
        }
        if (!Object.keys(t._customSize).length)
            t._customSize = null;
        temp.removeFromParent();
        if (temp.destroy)
            temp.destroy();
        return t._customSize;
    }
}
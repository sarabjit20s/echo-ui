import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { useScreenDimensions } from './useScreenDimensions';
import { useInsets } from './useInsets';

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';

type XAxis = 'x';
type YAxis = 'y';
type Axis = XAxis | YAxis;
type Side = 'top' | 'right' | 'bottom' | 'left';
type XSide = 'left' | 'right';
type YSide = 'top' | 'bottom';
type Alignment = 'start' | 'center' | 'end';
type Size = { width: number; height: number };

type ArrowData = {
  style: StyleProp<ViewStyle>;
};

type UsePositioningOptions = {
  /**
   * The anchor element to position the target element relative to.
   */
  anchorRef: React.RefObject<View>;
  /**
   * The target element to position relative to the anchor element.
   */
  targetRef: React.RefObject<View>;
  arrowRef?: React.RefObject<View>;
  /**
   * Whether to avoid collisions with the viewport.
   */
  avoidCollisions?: boolean;
  /**
   * The placement of the target element relative to the anchor element.
   */
  placement?: Placement;
  mainAxisOffset?: number;
  arrowMainAxisOffset?: number;
  /**
   * It helps to calculate the position of the arrow element
   */
  isTargetHeightFixed?: boolean;
  /**
   * Target element can cover the anchor element to avoid collisions
   */
  coverAnchorToAvoidCollisions?: boolean;
};
type UsePositioningReturn = {
  x: number;
  y: number;
  /**
   * The placement of the target element relative to the anchor element.
   */
  placement: Placement;
  /**
   * A boolean indicating whether the target element has been positioned.
   */
  isPositioned: boolean;
  /**
   * A function to update the position of the target element manually.
   * @returns void
   */
  update: () => void;
  arrowData: ArrowData | null;
  canRenderArrow: boolean;
};

const usePositioning = (
  options: UsePositioningOptions,
): UsePositioningReturn => {
  const {
    anchorRef,
    targetRef,
    arrowRef,
    placement = 'bottom',
    avoidCollisions = true,
    mainAxisOffset = 0,
    arrowMainAxisOffset = 0,
    isTargetHeightFixed = false,
    coverAnchorToAvoidCollisions = false,
  } = options;
  const { width: screenWidth, height: screenHeight } = useScreenDimensions();
  const insets = useInsets();

  const boundaryRect: Rect = React.useMemo(() => {
    return {
      x: 0,
      y: insets.top,
      width: screenWidth,
      // don't use window height here due to some issues(such as excluded status bar height) on Android
      height: screenHeight - insets.top - insets.bottom,
    };
  }, [screenWidth, screenHeight, insets.top, insets.bottom]);

  const [anchorRect, setAnchorRect] = React.useState<Rect | null>(null);
  const [targetSize, setTargetSize] = React.useState<Size | null>(null);
  const [arrowSize, setArrowSize] = React.useState<Size | null>(null);

  const [data, setData] = React.useState<{
    x: number;
    y: number;
    placement: Placement;
    isPositioned: boolean;
    arrowData: ArrowData | null;
    canRenderArrow: boolean;
  }>({
    x: 0,
    y: 0,
    placement,
    isPositioned: false,
    arrowData: null,
    canRenderArrow: true,
  });

  const update = React.useCallback(() => {
    if (!anchorRect || !targetSize) {
      return;
    }
    // Arrow increases the height of the target element if it is not fixed
    const _targetHeight =
      arrowSize?.height && !isTargetHeightFixed
        ? targetSize.height - arrowSize.height
        : targetSize.height;
    const _targetSize = {
      ...targetSize,
      height: _targetHeight,
    };
    const _arrowSize = arrowSize ?? { width: 0, height: 0 };

    const xData = calcX({
      anchorRect,
      boundaryRect,
      targetSize: _targetSize,
      arrowSize: _arrowSize,
      avoidCollisions,
      placement,
      mainAxisOffset,
      coverAnchorToAvoidCollisions,
    });

    const yData = calcY({
      anchorRect,
      boundaryRect,
      targetSize: _targetSize,
      arrowSize: _arrowSize,
      avoidCollisions,
      placement,
      mainAxisOffset,
      coverAnchorToAvoidCollisions,
    });

    const mainAxis = getMainAxis(placement);
    const side = mainAxis === 'x' ? xData.side : yData.side;
    const alignment = mainAxis === 'x' ? yData.alignment : xData.alignment;
    const newPlacement: Placement =
      alignment === 'center' ? side : `${side}-${alignment}`;
    const canRenderArrow = arrowRef?.current
      ? mainAxis === 'x'
        ? xData.canRenderArrow
        : yData.canRenderArrow
      : false;

    setData({
      x: xData.x,
      y: yData.y,
      placement: newPlacement,
      isPositioned: true,
      canRenderArrow,
      arrowData: arrowSize
        ? getArrowData({
            x: xData.x,
            y: yData.y,
            anchorRect,
            arrowSize,
            mainAxis,
            side,
            arrowMainAxisOffset,
          })
        : null,
    });
  }, [
    anchorRect,
    boundaryRect,
    targetSize,
    avoidCollisions,
    placement,
    mainAxisOffset,
    arrowSize,
    arrowMainAxisOffset,
    isTargetHeightFixed,
    coverAnchorToAvoidCollisions,
    arrowRef,
  ]);

  React.useLayoutEffect(() => {
    anchorRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setAnchorRect({
        x: pageX,
        y: pageY,
        width,
        height,
      });
    });

    targetRef.current?.measure((x, y, width, height) => {
      setTargetSize({
        width,
        height,
      });
    });

    arrowRef?.current?.measure((x, y, width, height) => {
      setArrowSize({
        width,
        height,
      });
    });
  }, [anchorRef, targetRef, arrowRef]);

  React.useLayoutEffect(() => {
    update();
  }, [update]);

  return { ...data, update };
};

function getMainAxis(placement: Placement): Axis {
  const side = placement.split('-')[0] as Side;
  if (side === 'top' || side === 'bottom') {
    return 'y';
  } else {
    return 'x';
  }
}

function getLeadingSide(axis: Axis): Side {
  return axis === 'x' ? 'left' : 'top';
}

function getTrailingSide(axis: Axis): Side {
  return axis === 'x' ? 'right' : 'bottom';
}

type CalcXParams = {
  anchorRect: Rect;
  boundaryRect: Rect;
  targetSize: Size;
  arrowSize: Size;
  placement: Placement;
  avoidCollisions: boolean;
  mainAxisOffset: number;
  coverAnchorToAvoidCollisions: boolean;
};
type CalcXReturn = {
  x: number;
  side: Side;
  alignment: Alignment;
  canRenderArrow: boolean;
};
function calcX({
  anchorRect,
  boundaryRect,
  targetSize,
  arrowSize,
  avoidCollisions = true,
  placement,
  mainAxisOffset,
  coverAnchorToAvoidCollisions,
}: CalcXParams): CalcXReturn {
  const { x: anchorX, width: anchorWidth } = anchorRect;
  const { width: targetWidth } = targetSize;

  const [initialSide, initialAlignment = 'center'] = placement.split('-') as [
    Side,
    Alignment,
  ];
  let x: number;
  let side: Side = initialSide;
  let alignment: Alignment = initialAlignment;
  let canRenderArrow = true;
  switch (placement) {
    case 'top':
    case 'bottom':
      const d = (anchorWidth - targetWidth) / 2;
      x = anchorX + d;
      break;
    case 'top-start':
    case 'bottom-start':
      x = anchorX;
      break;
    case 'top-end':
    case 'bottom-end':
      x = anchorX + anchorWidth - targetWidth;
      break;
    case 'left':
    case 'left-start':
    case 'left-end':
      x = anchorX - targetWidth - mainAxisOffset - arrowSize.height;
      break;
    case 'right':
    case 'right-start':
    case 'right-end':
      x = anchorX + anchorWidth + mainAxisOffset + arrowSize.height;
      break;
  }
  if (avoidCollisions) {
    const safe = getSafeCoord<XAxis>({
      axis: 'x',
      coord: x,
      boundaryCoord: boundaryRect.x,
      boundaryClientProp: boundaryRect.width,
      anchorCoord: anchorX,
      anchorClientProp: anchorWidth,
      targetClientProp: targetWidth,
      placement,
      mainAxisOffset,
      arrowSize,
      coverAnchorToAvoidCollisions,
    });
    x = safe.coord;
    side = safe.side;
    alignment = safe.alignment;
    canRenderArrow = safe.canRenderArrow;
  }
  return {
    x,
    side,
    alignment,
    canRenderArrow,
  };
}

type CalcYParams = {
  anchorRect: Rect;
  boundaryRect: Rect;
  targetSize: Size;
  arrowSize: Size;
  placement: Placement;
  avoidCollisions: boolean;
  mainAxisOffset: number;
  coverAnchorToAvoidCollisions: boolean;
};
type CalcYReturn = {
  y: number;
  side: Side;
  alignment: Alignment;
  canRenderArrow: boolean;
};
function calcY({
  anchorRect,
  boundaryRect,
  targetSize,
  arrowSize,
  avoidCollisions = true,
  placement,
  mainAxisOffset,
  coverAnchorToAvoidCollisions,
}: CalcYParams): CalcYReturn {
  const { y: anchorY, height: anchorHeight } = anchorRect;
  const { height: targetHeight } = targetSize;
  const [initialSide, initialAlignment = 'center'] = placement.split('-') as [
    Side,
    Alignment,
  ];
  let y: number;
  let side: Side = initialSide;
  let alignment: Alignment = initialAlignment;
  let canRenderArrow = true;
  switch (placement) {
    case 'top':
    case 'top-start':
    case 'top-end':
      y = anchorY - targetHeight - mainAxisOffset - arrowSize.height;
      break;
    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      y = anchorY + anchorHeight + mainAxisOffset + arrowSize.height;
      break;
    case 'left':
    case 'right':
      const d = (anchorHeight - targetHeight) / 2;
      y = anchorY + d;
      break;
    case 'left-start':
    case 'right-start':
      y = anchorY;
      break;
    case 'left-end':
    case 'right-end':
      y = anchorY + anchorHeight - targetHeight;
      break;
  }
  if (avoidCollisions) {
    const safe = getSafeCoord<YAxis>({
      axis: 'y',
      coord: y,
      boundaryCoord: boundaryRect.y,
      boundaryClientProp: boundaryRect.height,
      anchorCoord: anchorY,
      anchorClientProp: anchorHeight,
      targetClientProp: targetHeight,
      placement,
      mainAxisOffset,
      arrowSize,
      coverAnchorToAvoidCollisions,
    });
    y = safe.coord;
    side = safe.side;
    alignment = safe.alignment;
    canRenderArrow = safe.canRenderArrow;
  }
  return {
    y,
    side,
    alignment,
    canRenderArrow,
  };
}

type GetSafeCoordParams<T extends Axis> = {
  axis: T;
  coord: number;
  boundaryCoord: number;
  boundaryClientProp: number;
  anchorCoord: number;
  anchorClientProp: number;
  targetClientProp: number;
  placement: Placement;
  mainAxisOffset: number;
  arrowSize: Size;
  coverAnchorToAvoidCollisions: boolean;
};
type GetSafeCoordReturn = {
  coord: number;
  side: Side;
  alignment: Alignment;
  canRenderArrow: boolean;
};
function getSafeCoord<T extends Axis>({
  axis,
  coord,
  boundaryCoord,
  boundaryClientProp,
  anchorCoord,
  anchorClientProp,
  targetClientProp,
  placement,
  mainAxisOffset,
  arrowSize,
  coverAnchorToAvoidCollisions,
}: GetSafeCoordParams<T>): GetSafeCoordReturn {
  const [initialSide, initialAlignment = 'center'] = placement.split('-') as [
    T extends XAxis ? XSide : YSide,
    Alignment,
  ];
  let newCoord: number = coord;
  let newSide: Side = initialSide;
  let newAlignment: Alignment = initialAlignment;
  let canRenderArrow: boolean = true;

  const { collision, collisionSide } = getCollision({
    axis,
    coord,
    boundaryCoord,
    boundaryClientProp,
    targetClientProp,
  });

  if (!collision) {
    return {
      coord: newCoord,
      side: newSide,
      alignment: newAlignment,
      canRenderArrow,
    };
  }

  const mainAxis = getMainAxis(placement);

  // If the mainAxis is `axis` param, then we only need to change its Side
  // otherwise we need to change Alignment

  if (mainAxis === axis) {
    const data = getSafeCoordOnMainAxis<T>({
      mainAxis: axis,
      mainAxisOffset,
      initialSide,
      boundaryCoord,
      boundaryClientProp,
      anchorCoord,
      anchorClientProp,
      targetClientProp,
      arrowSize,
      coverAnchorToAvoidCollisions,
    });
    newCoord = data.coord;
    newSide = data.side;
    canRenderArrow = data.canRenderArrow;
  } else {
    const data = getSafeCoordOnCrossAxis<T>({
      crossAxis: axis,
      collisionSide,
      boundaryCoord,
      boundaryClientProp,
      anchorCoord,
      anchorClientProp,
      targetClientProp,
    });
    newCoord = data.coord;
    newAlignment = data.alignment;
  }

  return {
    coord: newCoord,
    side: newSide,
    alignment: newAlignment,
    canRenderArrow,
  };
}

type GetCollisionParams = {
  axis: Axis;
  coord: number;
  boundaryCoord: number;
  boundaryClientProp: number;
  targetClientProp: number;
};
type GetCollisionReturn =
  | {
      collision: true;
      collisionSide: Side;
    }
  | {
      collision: false;
      collisionSide: null;
    };
function getCollision({
  axis,
  coord,
  boundaryCoord,
  boundaryClientProp,
  targetClientProp,
}: GetCollisionParams): GetCollisionReturn {
  if (coord < boundaryCoord) {
    return {
      collision: true,
      collisionSide: getLeadingSide(axis),
    };
  } else if (coord + targetClientProp > boundaryClientProp) {
    return {
      collision: true,
      collisionSide: getTrailingSide(axis),
    };
  } else {
    return {
      collision: false,
      collisionSide: null,
    };
  }
}

type GetSafeCoordOnMainAxisParams<T extends Axis> = {
  mainAxis: T;
  mainAxisOffset: number;
  initialSide: T extends XAxis ? XSide : YSide;
  boundaryCoord: number;
  boundaryClientProp: number;
  anchorCoord: number;
  anchorClientProp: number;
  targetClientProp: number;
  arrowSize: Size;
  coverAnchorToAvoidCollisions: boolean;
};
type GetSafeCoordOnMainAxisReturn = {
  coord: number;
  side: Side;
  canRenderArrow: boolean;
};
function getSafeCoordOnMainAxis<T extends Axis>({
  mainAxis,
  mainAxisOffset,
  initialSide,
  boundaryCoord,
  boundaryClientProp,
  anchorCoord,
  anchorClientProp,
  targetClientProp,
  arrowSize,
  coverAnchorToAvoidCollisions,
}: GetSafeCoordOnMainAxisParams<T>): GetSafeCoordOnMainAxisReturn {
  let coord: number;
  let side: Side;
  let canRenderArrow: boolean = true;

  const leadingSide = getLeadingSide(mainAxis);
  const trailingSide = getTrailingSide(mainAxis);

  // check if the anchor element is inside the boundary or not
  if (anchorCoord + anchorClientProp < boundaryCoord) {
    // outside the boundary on the 'leading' side
    side = trailingSide;
    coord = boundaryCoord + mainAxisOffset + arrowSize.height;
  } else if (anchorCoord > boundaryClientProp) {
    // outside the boundary on the 'trailing' side
    side = leadingSide;
    coord =
      boundaryClientProp - targetClientProp - mainAxisOffset - arrowSize.height;
  } else {
    // the anchor element is inside the boundary
    // the new side is determined based on which side area is bigger
    side = getBiggerAreaSide<T>({
      mainAxis,
      initialSide,
      boundaryCoord,
      boundaryClientProp,
      anchorCoord,
      anchorClientProp,
      mainAxisOffset,
    });
    if (side === leadingSide) {
      coord =
        anchorCoord - targetClientProp - mainAxisOffset - arrowSize.height;
      if (coverAnchorToAvoidCollisions) {
        if (coord < boundaryCoord) {
          coord = boundaryCoord;
          canRenderArrow = false;
        }
      }
    } else {
      coord =
        anchorCoord + anchorClientProp + mainAxisOffset + arrowSize.height;
      if (coverAnchorToAvoidCollisions) {
        if (coord > boundaryClientProp - targetClientProp) {
          coord = Math.max(
            boundaryClientProp - targetClientProp,
            boundaryCoord,
          );
          canRenderArrow = false;
        }
      }
    }
  }

  return {
    coord,
    side,
    canRenderArrow,
  };
}

type GetSafeCoordOnCrossAxisParams<T extends Axis> = {
  crossAxis: T;
  collisionSide: Side;
  boundaryCoord: number;
  boundaryClientProp: number;
  anchorCoord: number;
  anchorClientProp: number;
  targetClientProp: number;
};
type GetSafeCoordOnCrossAxisReturn = {
  coord: number;
  alignment: Alignment;
};
function getSafeCoordOnCrossAxis<T extends Axis>({
  crossAxis,
  collisionSide,
  boundaryCoord,
  boundaryClientProp,
  anchorCoord,
  anchorClientProp,
  targetClientProp,
}: GetSafeCoordOnCrossAxisParams<T>): GetSafeCoordOnCrossAxisReturn {
  let coord: number;
  let alignment: Alignment;

  const leadingSide = getLeadingSide(crossAxis);

  if (anchorCoord + anchorClientProp < boundaryCoord) {
    // outside the boundary on the 'leading' side
    coord = boundaryCoord;
    alignment = 'start';
  } else if (anchorCoord + anchorClientProp > boundaryClientProp) {
    // outside the boundary on the 'trailing' side
    coord = boundaryClientProp - targetClientProp;
    alignment = 'end';
  } else {
    // inside the boundary
    // the new alignment is determined based on which alignment is closest to the anchor
    if (collisionSide === leadingSide) {
      coord = boundaryCoord;
      alignment = getClosestAlignment({
        coord,
        anchorCoord,
        anchorClientProp,
        targetClientProp,
      });
    } else {
      coord = boundaryClientProp - targetClientProp;
      alignment = getClosestAlignment({
        coord,
        anchorCoord,
        anchorClientProp,
        targetClientProp,
      });
    }
  }

  return {
    coord,
    alignment,
  };
}

type GetBiggerAreaSideParams<T extends Axis> = {
  mainAxis: T;
  initialSide: T extends XAxis ? XSide : YSide;
  boundaryCoord: number;
  boundaryClientProp: number;
  anchorCoord: number;
  anchorClientProp: number;
  mainAxisOffset: number;
};
/**
 * Only pass the main axis values
 */
function getBiggerAreaSide<T extends Axis>({
  mainAxis,
  initialSide,
  boundaryCoord,
  boundaryClientProp,
  anchorCoord,
  anchorClientProp,
  mainAxisOffset,
}: GetBiggerAreaSideParams<T>) {
  const leadingSide = getLeadingSide(mainAxis);
  const trailingSide = getTrailingSide(mainAxis);

  anchorCoord = Math.max(0, anchorCoord);
  const leadingSideArea = anchorCoord - mainAxisOffset - boundaryCoord;
  const trailingSideArea =
    boundaryClientProp - (anchorCoord + anchorClientProp + mainAxisOffset);

  if (leadingSideArea > trailingSideArea) {
    return leadingSide;
  } else if (leadingSideArea < trailingSideArea) {
    return trailingSide;
  } else {
    return initialSide;
  }
}

type GetClosestAlignmentParams = {
  coord: number;
  anchorCoord: number;
  anchorClientProp: number;
  targetClientProp: number;
};
/**
 * Only pass the cross axis values
 */
function getClosestAlignment({
  coord,
  anchorCoord,
  anchorClientProp,
  targetClientProp,
}: GetClosestAlignmentParams): Alignment {
  const anchorShiftCoord = anchorCoord + anchorClientProp / 2;
  const targetHalfSize = targetClientProp / 2;
  // d is the distance between anchorShiftCoord and coord
  const d = anchorShiftCoord - coord;
  if (d <= 0 || d < targetHalfSize) {
    return 'start';
  } else if (d > targetHalfSize) {
    return 'end';
  } else {
    return 'center';
  }
}

type GetArrowDataParams = {
  x: number;
  y: number;
  anchorRect: Rect;
  arrowSize: Size;
  mainAxis: Axis;
  side: Side;
  arrowMainAxisOffset: number;
};
function getArrowData({
  x,
  y,
  anchorRect,
  arrowSize,
  mainAxis,
  side,
  arrowMainAxisOffset,
}: GetArrowDataParams): ArrowData {
  let rotate: number = 0;
  let positionStyle: ViewStyle = {};

  if (mainAxis === 'x') {
    const anchorShiftY = anchorRect.y + anchorRect.height / 2;
    const fy = anchorShiftY - y;
    let arrowY = fy - arrowSize.height / 2;
    const arrowHeightAt90DegRotation =
      arrowSize.width - (arrowSize.width - arrowSize.height) / 2;
    if (side === 'left') {
      rotate = 90;
      positionStyle = {
        top: arrowY,
        right: -arrowHeightAt90DegRotation + arrowMainAxisOffset,
      };
    } else {
      rotate = -90;
      positionStyle = {
        top: arrowY,
        left: -arrowHeightAt90DegRotation + arrowMainAxisOffset,
      };
    }
  } else {
    const anchorShiftX = anchorRect.x + anchorRect.width / 2;
    const fx = anchorShiftX - x;
    let arrowX = fx - arrowSize.width / 2;
    if (side === 'top') {
      rotate = 180;
      positionStyle = {
        bottom: -arrowSize.height + arrowMainAxisOffset,
        left: arrowX,
      };
    } else {
      rotate = 0;
      positionStyle = {
        top: -arrowSize.height + arrowMainAxisOffset,
        left: arrowX,
      };
    }
  }

  return {
    style: {
      position: 'absolute',
      ...positionStyle,
      transform: [
        {
          rotate: `${rotate}deg`,
        },
      ],
    },
  };
}

export { usePositioning };
export type {
  Placement,
  Side,
  Alignment,
  Rect,
  Axis,
  UsePositioningOptions,
  UsePositioningReturn,
  ArrowData,
};

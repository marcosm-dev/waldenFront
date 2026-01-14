/**
 * UI Initiative Super Flow
 *
 * Realistic parallax & scale effects slider
 *
 * https://uiinitiative.com
 *
 * Copyright 2025 UI Initiative
 *
 * Released under the UI Initiative Regular License
 *
 * June 06, 2025
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.EffectSuperFlow = factory());
})(this, (function () { 'use strict';

  function elementTransitionEnd(el, callback) {
    function fireCallBack(e) {
      if (e.target !== el) return;
      callback.call(el, e);
      el.removeEventListener('transitionend', fireCallBack);
    }
    if (callback) {
      el.addEventListener('transitionend', fireCallBack);
    }
  }

  function effectInit(params) {
    const {
      effect,
      swiper,
      on,
      setTranslate,
      setTransition,
      overwriteParams,
      perspective,
      recreateShadows,
      getEffectParams
    } = params;
    on('beforeInit', () => {
      if (swiper.params.effect !== effect) return;
      swiper.classNames.push(`${swiper.params.containerModifierClass}${effect}`);
      if (perspective && perspective()) {
        swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);
      }
      const overwriteParamsResult = overwriteParams ? overwriteParams() : {};
      Object.assign(swiper.params, overwriteParamsResult);
      Object.assign(swiper.originalParams, overwriteParamsResult);
    });
    on('setTranslate _virtualUpdated', () => {
      if (swiper.params.effect !== effect) return;
      setTranslate();
    });
    on('setTransition', (_s, duration) => {
      if (swiper.params.effect !== effect) return;
      setTransition(duration);
    });
    on('transitionEnd', () => {
      if (swiper.params.effect !== effect) return;
      if (recreateShadows) {
        if (!getEffectParams || !getEffectParams().slideShadows) return;
        // remove shadows
        swiper.slides.forEach(slideEl => {
          slideEl.querySelectorAll('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left').forEach(shadowEl => shadowEl.remove());
        });
        // create new one
        recreateShadows();
      }
    });
    let requireUpdateOnVirtual;
    on('virtualUpdate', () => {
      if (swiper.params.effect !== effect) return;
      if (!swiper.slides.length) {
        requireUpdateOnVirtual = true;
      }
      requestAnimationFrame(() => {
        if (requireUpdateOnVirtual && swiper.slides && swiper.slides.length) {
          setTranslate();
          requireUpdateOnVirtual = false;
        }
      });
    });
  }

  function effectVirtualTransitionEnd(_ref) {
    let {
      swiper,
      duration,
      transformElements} = _ref;
    const {
      activeIndex
    } = swiper;
    if (swiper.params.virtualTranslate && duration !== 0) {
      let eventTriggered = false;
      let transitionEndTarget;
      {
        transitionEndTarget = transformElements;
      }
      transitionEndTarget.forEach(el => {
        elementTransitionEnd(el, () => {
          if (eventTriggered) return;
          if (!swiper || swiper.destroyed) return;
          eventTriggered = true;
          swiper.animating = false;
          const evt = new window.CustomEvent('transitionend', {
            bubbles: true,
            cancelable: true
          });
          swiper.wrapperEl.dispatchEvent(evt);
        });
      });
    }
  }

  if (typeof window !== 'undefined' && window.SwiperElementRegisterParams) {
    window.SwiperElementRegisterParams(['superFlowEffect']);
  }

  function EffectSuperFlow({ swiper, on, extendParams }) {
    extendParams({
      superFlowEffect: {
        fragments: 3,
        fragmentBorderWidth: 1,
        fragmentBlur: false,
        contentOffset: 5,
        contentScale: 1.2,
        scaleDuration: 10000,
        mainImageScale: 1.1,
        level1Scale: 1.15,
        level2Scale: 1.2,
        level3Scale: 1.25,
      },
    });
    let animationInSlideIndex = null;

    const getSlideIndex = (slideEl) => {
      if (
        swiper.params.loop ||
        (swiper.params.virtual && swiper.virtual && swiper.params.virtual.enabled)
      ) {
        return parseInt(slideEl.getAttribute('data-swiper-slide-index'), 10);
      } else {
        const index = Array.from(swiper.slides).indexOf(slideEl);
        return index;
      }
    };

    const getFragmentsByLevel = (slideEl) => {
      const fragmentsEl = slideEl.querySelector('.super-flow-fragments');
      const fragmentsChildren = fragmentsEl ? [...fragmentsEl.children] : [];
      const level1Indexes = [0, 1, 6, 7];
      const level2Indexes = [2, 3, 8, 9];
      const level3Indexes = [4, 5, 10, 11];
      const level1Fragments = level1Indexes
        .map((i) => fragmentsChildren[i])
        .filter(Boolean);
      const level2Fragments = level2Indexes
        .map((i) => fragmentsChildren[i])
        .filter(Boolean);
      const level3Fragments = level3Indexes
        .map((i) => fragmentsChildren[i])
        .filter(Boolean);
      return {
        allFragments: fragmentsChildren,
        level1Fragments,
        level2Fragments,
        level3Fragments,
      };
    };

    const getTranslate = (v = 0) => {
      const isHorizontal = swiper.isHorizontal();
      return isHorizontal ? `translate(${v}, 0)` : `translate(0, ${v})`;
    };

    const setTranslate = () => {
      const { slides, rtlTranslate: rtl } = swiper;
      const { size } = swiper;

      for (let i = 0; i < slides.length; i += 1) {
        const slideEl = slides[i];
        const slideIndex = getSlideIndex(slideEl);
        const contentEl = slideEl.querySelector('.super-flow-content');
        const imagesContainerEl = slideEl.querySelector('.super-flow-image');
        const fragmentsEl = slideEl.querySelector('.super-flow-fragments');
        const { level1Fragments, level2Fragments, level3Fragments } =
          getFragmentsByLevel(slideEl);
        const progress = slideEl.progress;
        let offset;
        let imageScale = 1;
        let imageOffset = 0;
        let fragmentsScale = 1;
        let fragmentsOffset = 0;
        let contentOffset = 0;
        let level1Offset = 0;
        let level2Offset = 0;
        let level3Offset = 0;
        const rtlMultiplier = rtl ? -1 : 1;
        if (progress <= 0) {
          // next slides
          contentOffset =
            -swiper.params.superFlowEffect.contentOffset * rtlMultiplier;
          offset = size * progress + swiper.translate * rtlMultiplier;
          imageScale = 1.1 - 0.1 * Math.min(1, Math.abs(progress));
          imageOffset = 20 * rtlMultiplier * Math.min(1, Math.abs(progress));
          fragmentsScale = 0.95 + 0.05 * Math.min(1, Math.abs(progress));
          level1Offset = 30 * rtlMultiplier * Math.min(1, Math.abs(progress));
          level2Offset = 20 * rtlMultiplier * Math.min(1, Math.abs(progress));
          level3Offset = 10 * rtlMultiplier * Math.min(1, Math.abs(progress));
        } else {
          // current slide
          offset =
            (swiper.translate -
              Math.min(progress, 1) * size * 0.09 * rtlMultiplier) *
            rtlMultiplier;
          imageScale = 1.1;
          fragmentsOffset = 5 * Math.min(1, Math.abs(progress));
          fragmentsScale = 0.95;
        }

        if (rtl) {
          offset = -offset;
        }
        if (imagesContainerEl) {
          imagesContainerEl.style.transform = `scale(${imageScale}) ${getTranslate(imageOffset + '%')}`;
        }
        if (fragmentsEl) {
          fragmentsEl.style.transform = `scale(${fragmentsScale}) ${getTranslate(fragmentsOffset + '%')}`;
        }

        if (slideIndex !== animationInSlideIndex) {
          if (contentEl) {
            contentEl.style.transform = getTranslate(`${contentOffset}%`);
          }
          level1Fragments.forEach((el) => {
            el.style.transform = getTranslate(level1Offset + '%');
          });
          level2Fragments.forEach((el) => {
            el.style.transform = getTranslate(level2Offset + '%');
          });
          level3Fragments.forEach((el) => {
            el.style.transform = getTranslate(level3Offset + '%');
          });
        }

        slideEl.style.transform = getTranslate(offset + 'px');
        slideEl.style.zIndex = swiper.slides.length - i;
      }
    };

    const setTransition = (duration) => {
      const { slides } = swiper;
      for (let i = 0; i < slides.length; i += 1) {
        const slideEl = slides[i];
        const slideIndex = getSlideIndex(slideEl);
        let addToSelector = '';
        if (slideIndex !== animationInSlideIndex) {
          addToSelector =
            ', .super-flow-image img, .super-flow-fragment, .super-flow-fragment-border,  .super-flow-content';
        }
        [
          slideEl,
          ...slideEl.querySelectorAll(
            `.super-flow-fragments, .super-flow-image${addToSelector}`,
          ),
        ].forEach((el) => {
          el.style.transitionDuration = `${duration}ms`;
        });
      }
      effectVirtualTransitionEnd({
        swiper,
        duration,
        transformElements: slides});
    };

    const percents = {
      left: [],
      right: [],
    };
    const getClipPath = (side, level, borderWidth) => {
      let top = 0;
      let bottom = 0;
      if (side === 'left') {
        if (level === 0) {
          top = 20 + Math.random() * 5;
          bottom = 5 + Math.random() * 5;
          percents.left.push([top, bottom]);
        } else if (level === 1) {
          top = 5 + Math.random() * 5;
          bottom = 10 + Math.random() * 10;
        } else if (level === 2) {
          top = percents.left[0][0] - Math.random() * 10;
          bottom = percents.left[0][1] - Math.random() * 5;
        }
      }
      if (side === 'right') {
        if (level === 0) {
          top = 5 + Math.random() * 5;
          bottom = 20 + Math.random() * 10;
          percents.right.push([top, bottom]);
        } else if (level === 1) {
          top = 10 + Math.random() * 10;
          bottom = 5 + Math.random() * 5;
        } else if (level === 2) {
          top = percents.right[0][0] - Math.random() * 5;
          bottom = percents.right[0][1] - Math.random() * 10;
        }
      }
      const points =
        side === 'left'
          ? [
              [0, 0],
              [top, 0],
              [bottom, 100],
              [0, 100],
            ]
          : [
              [100, 0],
              [100 - top, 0],
              [100 - bottom, 100],
              [100, 100],
            ];
      let borderClipPath = '';
      let imageClipPath = '';
      if (side === 'left') {
        borderClipPath = `polygon(${points.map((p) => p.map((el, axis) => (axis === 0 ? `calc(${el}% + ${borderWidth}px)` : `${el}%`)).join(' ')).join(',')})`;
      }
      if (side === 'right') {
        borderClipPath = `polygon(${points.map((p) => p.map((el, axis) => (axis === 0 ? `calc(${el}% - ${borderWidth}px)` : `${el}%`)).join(' ')).join(',')})`;
      }
      imageClipPath = `polygon(${points.map((p) => p.map((el) => `${el}%`).join(' ')).join(',')})`;
      return { borderClipPath, imageClipPath };
    };
    const createFragments = (s) => {
      const borderWidth = s.params.superFlowEffect.fragmentBorderWidth;
      const hasBlur = s.params.superFlowEffect.fragmentBlur;
      const isHorizontal = swiper.isHorizontal();
      const rtl = swiper.rtlTranslate;
      swiper.el.querySelectorAll('.super-flow-image').forEach((el) => {
        const mainImage = el.querySelector('img:not(.super-flow-fragment)');
        if (!mainImage) return;
        el.querySelectorAll(
          '.super-flow-fragment, .super-flow-fragment-border',
        ).forEach((fragmentEl) => {
          fragmentEl.remove();
        });
        // set main image clip path
        const isTop = Math.random() > 0.5;
        const offset = (5 + Math.random() * 4) / 2;
        const points = isHorizontal
          ? rtl
            ? [
                [isTop ? offset : 0, 0],
                [100, 0],
                [100, 100],
                [!isTop ? offset : 0, 100],
              ]
            : [
                [0, 0],
                [isTop ? 100 - offset : 100, 0],
                [!isTop ? 100 - offset : 100, 100],
                [0, 100],
              ]
          : [
              [0, 0],
              [100, 0],
              [100, isTop ? 100 - offset : 100],
              [0, !isTop ? 100 - offset : 100],
            ];
        el.style.clipPath = `polygon(${points.map((p) => p.map((el) => `${el}%`).join(' ')).join(',')})`;
        const fragmentsEl = document.createElement('div');
        fragmentsEl.classList.add('super-flow-fragments');
        el.appendChild(fragmentsEl);

        const fragments = Math.min(
          Math.max(0, s.params.superFlowEffect.fragments),
          3,
        );

        // add left edges
        for (let i = 0; i < fragments; i += 1) {
          const imageEl = mainImage.cloneNode(true);
          const borderEl = document.createElement('div');
          imageEl.classList.add('super-flow-fragment');
          borderEl.classList.add('super-flow-fragment-border');
          const { borderClipPath, imageClipPath } = getClipPath(
            'left',
            i,
            borderWidth,
          );
          borderEl.style.clipPath = borderClipPath;
          imageEl.style.clipPath = imageClipPath;
          if (hasBlur) {
            imageEl.style.filter = `blur(${i + 1}px)`;
          }
          fragmentsEl.appendChild(borderEl);
          fragmentsEl.appendChild(imageEl);
        }

        // add right edges
        for (let i = 0; i < fragments; i += 1) {
          const imageEl = mainImage.cloneNode(true);
          const borderEl = document.createElement('div');
          imageEl.classList.add('super-flow-fragment');
          borderEl.classList.add('super-flow-fragment-border');
          const { borderClipPath, imageClipPath } = getClipPath(
            'right',
            i,
            borderWidth,
          );
          borderEl.style.clipPath = borderClipPath;
          imageEl.style.clipPath = imageClipPath;
          if (hasBlur) {
            imageEl.style.filter = `blur(${i + 1}px)`;
          }
          fragmentsEl.appendChild(borderEl);
          fragmentsEl.appendChild(imageEl);
        }
      });
    };

    const cleanUp = () => {
      const otherSlideEls = swiper.slides.filter((el, index) => {
        const slideIndex = getSlideIndex(el);
        const compareIndex = swiper.params.loop
          ? swiper.realIndex
          : swiper.activeIndex;
        return slideIndex !== compareIndex;
      });

      otherSlideEls.forEach((el, index) => {
        el.querySelectorAll(
          'img, .super-flow-fragment, .super-flow-fragment-border',
        ).forEach((el) => {
          el.style.transitionDuration = '0ms';
          el.style.transform = '';
        });
      });
    };

    const animate = () => {
      const isVirtual =
        swiper.params.virtual && swiper.virtual && swiper.params.virtual.enabled;
      const slideEl = isVirtual
        ? swiper.slides.find(
            (el) =>
              el.getAttribute('data-swiper-slide-index') ===
              (swiper.params.loop
                ? swiper.realIndex
                : swiper.activeIndex
              ).toString(),
          )
        : swiper.slides[swiper.activeIndex];

      const slideIndex = getSlideIndex(slideEl);
      const rtlMultiplier = swiper.rtlTranslate ? -1 : 1;
      if (slideIndex === animationInSlideIndex) {
        return;
      }
      animationInSlideIndex = slideIndex;

      const params = swiper.params.superFlowEffect;
      const {
        scaleDuration,
        mainImageScale,
        level1Scale,
        level2Scale,
        level3Scale,
        contentOffset,
        contentScale,
      } = params;

      const mainImageEl = slideEl.querySelector('.super-flow-image > img');
      const contentEl = slideEl.querySelector('.super-flow-content');
      const { allFragments, level1Fragments, level2Fragments, level3Fragments } =
        getFragmentsByLevel(slideEl);

      if (mainImageEl) {
        mainImageEl.style.transitionDuration = '0ms';
        mainImageEl.style.transitionTimingFunction = 'linear';
        mainImageEl.style.transform = `${getTranslate()} scale(1)`;
      }
      if (contentEl) {
        contentEl.style.transitionDuration = '0ms';
        mainImageEl.style.transitionTimingFunction = 'linear';
        contentEl.style.transform = getTranslate(
          `${-contentOffset * rtlMultiplier}%`,
        );
      }
      allFragments.forEach((el) => {
        el.style.transitionDuration = '0ms';
        el.style.transform = getTranslate();
      });

      slideEl.clientLeft;

      if (mainImageEl) {
        mainImageEl.style.transitionDuration = `${scaleDuration}ms`;
        mainImageEl.style.transitionTimingFunction = 'linear';
        mainImageEl.style.transform = `${getTranslate()} scale(${mainImageScale})`;
      }
      if (contentEl) {
        contentEl.style.transitionDuration = `${scaleDuration}ms`;
        contentEl.style.transitionTimingFunction = 'linear';
        contentEl.style.transform = `${getTranslate(`${contentOffset * rtlMultiplier}%`)} scale(${contentScale})`;
      }
      allFragments.forEach((el) => {
        el.style.transitionDuration = `${scaleDuration}ms`;
        el.style.transitionTimingFunction = 'linear';
      });

      level1Fragments.forEach((el) => {
        el.style.transform = `${getTranslate()} scale(${level1Scale})`;
      });
      level2Fragments.forEach((el) => {
        el.style.transform = `${getTranslate()} scale(${level2Scale})`;
      });
      level3Fragments.forEach((el) => {
        el.style.transform = `${getTranslate()} scale(${level3Scale})`;
      });
    };

    let justTouched = false;

    const onTouchEnd = () => {
      justTouched = true;
      requestAnimationFrame(() => {
        justTouched = false;
      });
    };

    const onTransitionStart = () => {
      if (justTouched) {
        return;
      }
      animate();
    };

    const onTransitionEnd = () => {
      cleanUp();
      animate();
    };

    const onInit = () => {
      if (swiper.params.initialSlide === 0) {
        animate();
      }
    };

    on('beforeInit', createFragments);
    on('init', onInit);
    on('touchEnd', onTouchEnd);
    on('transitionStart', onTransitionStart);
    on('transitionEnd', onTransitionEnd);
    on('virtualUpdate', setTranslate);
    effectInit({
      effect: 'super-flow',
      swiper,
      on,
      setTranslate,
      setTransition,
      perspective: () => false,
      overwriteParams: () => {
        let newBreakpoints = {};
        if (swiper.passedParams.breakpoints) {
          Object.keys(swiper.passedParams.breakpoints).forEach((key) => {
            newBreakpoints[key] = {
              ...swiper.passedParams.breakpoints[key],
              slidesPerView: 1,
              spaceBetween: 0,
            };
          });
        }
        return {
          virtualTranslate: true,
          // resizeObserver: false,
          centeredSlides: false,
          slidesPerGroup: 1,
          slidesPerView: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          breakpoints: newBreakpoints,
        };
      },
    });
  }

  return EffectSuperFlow;

}));
//# sourceMappingURL=effect-super-flow.js.map

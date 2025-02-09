import Vue, { PropType } from 'vue';
import { ChevronRightIcon } from 'tdesign-icons-vue';
import { prefix } from '../../config';

// utils
import CLASSNAMES from '../../utils/classnames';
import ripple from '../../utils/ripple';

// common logic
import { getFullPathLabel } from '../utils/helper';
import { getCascaderItemClass, getCascaderItemIconClass, getLabelIsEllipsis } from '../utils/item';

// component
import Loading from '../../loading';
import Checkbox, { CheckboxProps } from '../../checkbox/index';
import Tooltip from '../../tooltip/index';

// type
import TreeNode from '../../_common/js/tree/tree-node';
import { ClassName } from '../../common';
import { ContextType, CascaderContextType, CascaderItemPropsType } from '../interface';
import { TreeNodeValue } from '../../_common/js/tree/types';

const name = `${prefix}-cascader-item`;
const ComponentClassName = `${prefix}-cascader__item`;

export default Vue.extend({
  name,

  directives: { ripple },

  props: {
    node: {
      type: Object as PropType<CascaderItemPropsType['node']>,
      default() {
        return {} as TreeNode;
      },
    },
    cascaderContext: {
      type: Object as PropType<CascaderItemPropsType['cascaderContext']>,
    },
  },

  computed: {
    itemClass(): ClassName {
      return getCascaderItemClass(prefix, this.node, CLASSNAMES, this.cascaderContext);
    },
    iconClass(): ClassName {
      return getCascaderItemIconClass(prefix, this.node, CLASSNAMES, this.cascaderContext);
    },
  },
  render() {
    const {
      node,
      itemClass,
      iconClass,
      cascaderContext,
    } = this;

    const handleClick = (e: Event) => {
      e.stopPropagation();
      const ctx: ContextType = {
        e,
        node,
      };
      this.$emit('click', ctx);
    };

    const handleChange: CheckboxProps['onChange'] = (e) => {
      const ctx = {
        e,
        node,
      };
      this.$emit('change', ctx);
    };

    const handleMouseenter = (e: Event) => {
      e.stopPropagation();
      const ctx: ContextType = {
        e,
        node,
      };
      this.$emit('mouseenter', ctx);
    };

    function RenderLabelInner(node: TreeNode, cascaderContext: CascaderContextType) {
      const { filterActive, inputVal } = cascaderContext;
      const labelText = filterActive ? getFullPathLabel(node) : node.label;
      if (filterActive) {
        const texts = labelText.split(inputVal);
        const doms = [];
        for (let index = 0; index < texts.length; index++) {
          doms.push(<span>{texts[index]}</span>);
          if (index === texts.length - 1) break;
          doms.push(<span class={`${ComponentClassName}-label--filter`}>{inputVal}</span>);
        }
        return doms;
      }
      return labelText;
    }

    function RenderLabelContent(node: TreeNode, cascaderContext: CascaderContextType) {
      const label = RenderLabelInner(node, cascaderContext);
      const isEllipsis = getLabelIsEllipsis(node, cascaderContext.size);
      if (isEllipsis) {
        return (
          <span class={`${ComponentClassName}-label`} role="label">
            {label}
            <div class={`${ComponentClassName}-label--ellipsis`}>
              <Tooltip content={node.label} placement="top-left" />
            </div>
          </span>
        );
      }
      return (
        <span class={[`${ComponentClassName}-label`]} role="label">
          {label}
        </span>
      );
    }

    function RenderCheckBox(node: TreeNode, cascaderContext: CascaderContextType, handleChange: CheckboxProps['onChange']) {
      const {
        checkProps, value, max, size,
      } = cascaderContext;
      const label = RenderLabelInner(node, cascaderContext);
      return (<Checkbox
        checked={node.checked}
        indeterminate={node.indeterminate}
        disabled={node.isDisabled() || ((value as TreeNodeValue[]).length >= max && max !== 0)}
        name={node.value}
        size={size}
        onChange={handleChange}
        {...checkProps}
      >{label}</Checkbox>);
    }

    return (<li v-ripple class={itemClass} onClick={handleClick} onMouseenter={handleMouseenter}>
      {cascaderContext.multiple ? RenderCheckBox(node, cascaderContext, handleChange) : RenderLabelContent(node, cascaderContext)}
      {node.children
        && (node.loading ? <Loading class={iconClass} size="small"/> : <ChevronRightIcon class={iconClass} />)}
    </li >);
  },
});

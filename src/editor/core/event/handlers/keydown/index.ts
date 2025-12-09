import { EditorMode, EditorZone } from '../../../../dataset/enum/Editor'
import { KeyMap } from '../../../../dataset/enum/KeyMap'
import { isMod } from '../../../../utils/hotkey'
import { CanvasEvent } from '../../CanvasEvent'
import { backspace } from './backspace'
import { del } from './delete'
import { enter } from './enter'
import { left } from './left'
import { right } from './right'
import { tab } from './tab'
import { updown } from './updown'
import { toggleCheckboxRadio } from './checkbox-radio'

export function keydown(evt: KeyboardEvent, host: CanvasEvent) {
  if (host.isComposing) return
  const draw = host.getDraw()
  
  // Check if a control popup is open (Select, Date)
  // 检查控件弹窗是否打开（选择框、日期）
  const control = draw.getControl()
  const activeControl = control.getActiveControl()
  const hasOpenPopup = activeControl && activeControl.getIsPopup && activeControl.getIsPopup()
  
  // If popup open, let control handle Enter and Space
  // 如果弹窗打开，让控件处理回车和空格键
  if (hasOpenPopup && (evt.key === KeyMap.Enter || evt.key === ' ')) {
    const curIndex = control.keydown(evt)
    if (curIndex != null) {
      draw.render({
        curIndex,
        isCompute: false,
        isSubmitHistory: false,
        isSetCursor: true
      })
    }
    return
  }
  
  // Handle Enter/Space for checkbox/radio toggle
  // 处理回车/空格键切换复选框/单选框
  if (evt.key === KeyMap.Enter || evt.key === ' ') {
    if (toggleCheckboxRadio(evt, host)) {
      return
    }
  }
  
  // 键盘事件逻辑分发
  if (evt.key === KeyMap.Backspace) {
    backspace(evt, host)
  } else if (evt.key === KeyMap.Delete) {
    del(evt, host)
  } else if (evt.key === KeyMap.Enter) {
    enter(evt, host)
  } else if (evt.key === KeyMap.Left) {
    left(evt, host)
  } else if (evt.key === KeyMap.Right) {
    right(evt, host)
  } else if (evt.key === KeyMap.Up || evt.key === KeyMap.Down) {
    updown(evt, host)
  } else if (isMod(evt) && evt.key.toLocaleLowerCase() === KeyMap.Z) {
    if (draw.isReadonly() && draw.getMode() !== EditorMode.FORM) return
    draw.getHistoryManager().undo()
    evt.preventDefault()
  } else if (isMod(evt) && evt.key.toLocaleLowerCase() === KeyMap.Y) {
    if (draw.isReadonly() && draw.getMode() !== EditorMode.FORM) return
    draw.getHistoryManager().redo()
    evt.preventDefault()
  } else if (isMod(evt) && evt.key.toLocaleLowerCase() === KeyMap.C) {
    host.copy()
    evt.preventDefault()
  } else if (isMod(evt) && evt.key.toLocaleLowerCase() === KeyMap.X) {
    host.cut()
    evt.preventDefault()
  } else if (isMod(evt) && evt.key.toLocaleLowerCase() === KeyMap.A) {
    host.selectAll()
    evt.preventDefault()
  } else if (isMod(evt) && evt.key.toLocaleLowerCase() === KeyMap.S) {
    if (draw.isReadonly()) return
    const listener = draw.getListener()
    if (listener.saved) {
      listener.saved(draw.getValue())
    }
    const eventBus = draw.getEventBus()
    if (eventBus.isSubscribe('saved')) {
      eventBus.emit('saved', draw.getValue())
    }
    evt.preventDefault()
  } else if (evt.key === KeyMap.ESC) {
    // 退出格式刷
    host.clearPainterStyle()
    // 退出页眉页脚编辑
    const zoneManager = draw.getZone()
    if (!zoneManager.isMainActive()) {
      zoneManager.setZone(EditorZone.MAIN)
    }
    evt.preventDefault()
  } else if (evt.key === KeyMap.TAB) {
    tab(evt, host)
  }
}

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useBoard, readout, SEGMENTS, displayPayload } from '../src/state/board';
import { projects } from '../src/data/portfolio';
beforeEach(() => useBoard.setState({ module:'Home',item:0,switches:Array(16).fill(false),powered:true,camera:'BOARD_OVERVIEW',transitioning:false,booting:false,display:null }));
test('section switches are exclusive while input switches remain independent', () => {
  const s=useBoard.getState();s.toggleSwitch(15);s.toggleSwitch(0);s.toggleSwitch(2);
  assert.equal(useBoard.getState().module,'Research');
  assert.equal(useBoard.getState().switches[0],false);assert.equal(useBoard.getState().switches[2],true);assert.equal(useBoard.getState().switches[15],true);
  s.toggleSwitch(2);assert.equal(useBoard.getState().module,'Home');
});
test('physical buttons navigate and wrap project selection', () => {
  const s=useBoard.getState();s.toggleSwitch(0);s.press('BTNL');
  assert.equal(useBoard.getState().item,projects.length-1);s.press('BTNR');assert.equal(useBoard.getState().item,0);
  s.press('BTND');assert.equal(useBoard.getState().module,'Experience');
});
test('eight digits encode section, project index and all sixteen switch bits', () => {
  const s=useBoard.getState();s.toggleSwitch(0);s.toggleSwitch(15);
  assert.equal(readout(useBoard.getState()),'01018001');
  assert.equal(SEGMENTS['1'],'BC');assert.equal(SEGMENTS['8'],'ABCDEFG');
  s.power();assert.equal(readout(useBoard.getState()),'        ');s.press('BTNR');assert.equal(useBoard.getState().item,0);
});
test('reset clears controls and performs a complete segment test', () => {
  const s=useBoard.getState();s.toggleSwitch(15);s.select('Projects');s.step(3);s.press('CPU_RESET');
  assert.equal(readout(useBoard.getState()),'88888888');assert.equal(useBoard.getState().switches.some(Boolean),false);
  s.finishBoot();assert.equal(readout(useBoard.getState()),'00000000');
});
test('camera changes preserve section state and reject overlapping transitions', () => {
  const s=useBoard.getState();s.select('Projects');s.step(2);s.view('BOARD_CLOSEUP');s.view('BOARD_TOP');
  assert.equal(useBoard.getState().camera,'BOARD_CLOSEUP');s.settle();s.back();s.settle();
  assert.equal(useBoard.getState().item,2);assert.equal(useBoard.getState().module,'Projects');
});
test('display focus is unavailable until a display is attached; payload is independent', () => {
  const s=useBoard.getState();s.view('DISPLAY_FOCUS');assert.equal(useBoard.getState().camera,'BOARD_OVERVIEW');
  s.select('Projects');assert.equal(displayPayload(useBoard.getState()).title,'Scribo');
  s.attachDisplay({position:[1,1,0],normal:[0,0,1],width:3,height:2});s.view('DISPLAY_FOCUS');assert.equal(useBoard.getState().camera,'DISPLAY_FOCUS');
});

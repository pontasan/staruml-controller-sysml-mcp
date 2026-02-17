#!/usr/bin/env node
import { apiGet, apiPost, apiDelete, encId, runTest } from './test-utils.mjs';

const DIR = import.meta.dirname;

await runTest('sysml', DIR, async (ctx) => {
  // --- Requirements Diagram ---
  let s = ctx.step('Create requirements diagram');
  let reqDiagramId;
  try {
    const res = await apiPost('/api/sysml/diagrams', { name: 'Test Requirements', type: 'SysMLRequirementDiagram' });
    reqDiagramId = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Create requirement (Performance)');
  let req1Id;
  try {
    const res = await apiPost('/api/sysml/requirements', { diagramId: reqDiagramId, name: 'Performance', text: 'Response time < 200ms', requirementId: 'REQ-001', x1: 50, y1: 50, x2: 280, y2: 130 });
    req1Id = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Create requirement (Latency)');
  let req2Id;
  try {
    const res = await apiPost('/api/sysml/requirements', { diagramId: reqDiagramId, name: 'Latency', text: 'Network latency < 50ms', requirementId: 'REQ-002', x1: 50, y1: 200, x2: 280, y2: 280 });
    req2Id = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Create derive-reqt: Performance → Latency');
  try {
    await apiPost('/api/sysml/derive-reqts', { diagramId: reqDiagramId, sourceId: req1Id, targetId: req2Id });
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  await ctx.layoutDiagram(reqDiagramId);
  await ctx.exportDiagram(reqDiagramId, 'Export requirements diagram');

  // --- Block Definition Diagram ---
  s = ctx.step('Create BDD');
  let bddId;
  try {
    const res = await apiPost('/api/sysml/diagrams', { name: 'Test BDD', type: 'SysMLBlockDefinitionDiagram' });
    bddId = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Create block (Vehicle)');
  let vehId;
  try {
    const res = await apiPost('/api/sysml/blocks', { diagramId: bddId, type: 'SysMLBlock', name: 'Vehicle', x1: 50, y1: 50, x2: 250, y2: 180 });
    vehId = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Add property to Vehicle');
  try {
    await apiPost(`/api/sysml/blocks/${encId(vehId)}/properties`, { name: 'speed', type: 'Real' });
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Create block (Engine)');
  let engId;
  try {
    const res = await apiPost('/api/sysml/blocks', { diagramId: bddId, type: 'SysMLBlock', name: 'Engine', x1: 350, y1: 50, x2: 550, y2: 180 });
    engId = res.data._id;
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  // Place requirement view on BDD so satisfy can connect them on same diagram
  s = ctx.step('Create view of requirement on BDD');
  try {
    await apiPost(`/api/diagrams/${encId(bddId)}/create-view-of`, { modelId: req1Id, x: 200, y: 280 });
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Create satisfy: Vehicle → Performance req');
  try {
    await apiPost('/api/sysml/satisfies', { diagramId: bddId, sourceId: vehId, targetId: req1Id });
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  await ctx.layoutDiagram(bddId);
  await ctx.exportDiagram(bddId, 'Export BDD image');

  // Cleanup
  s = ctx.step('Delete requirements diagram');
  try {
    await apiDelete(`/api/sysml/diagrams/${encId(reqDiagramId)}`);
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }

  s = ctx.step('Delete BDD');
  try {
    await apiDelete(`/api/sysml/diagrams/${encId(bddId)}`);
    s.pass();
  } catch (e) { s.fail(e.message); throw e; }
});

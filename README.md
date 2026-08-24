# DOOM: Autonomous Tactical Drone Swarm & Mission Control

Imported and adapted directly from Google Stitch project design (`AEGIS-SAR` rebranded to **DOOM**).

## Features
- **Tactical HUD Map**: Real-time swarm positioning, dynamic status indicators, and thermal heatmap toggles.
- **Victim Triage Registry**: Sortable casualty list, vital differential indicators, and 1-click Lifeline UAV dispatch.
- **Reasoning Trace / LLM**: Step-by-step edge AI reasoning and stigmergic ACS arbitration tree.
- **Drone Telemetry Pod**: Deep telemetry inspection for 6S LiPo battery, AGL altitude, LiDAR, thermal core, and mesh link RSSI.
- **Blackbox Playback**: 150-second continuous circular telemetry scrubber with live stream return.

## How to Run
Double-click `start.bat` in the `doom` folder or run:
```bash
cd doom
npm install
npm run dev
```

import { createServer, sysmlTools } from "staruml-controller-mcp-core"

export function createSysmlServer() {
    return createServer("staruml-controller-sysml", "1.0.0", sysmlTools)
}

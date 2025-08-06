export const Status = {
    running: "running",
    won: "won",
    lose: "lose",
    refund: "refund",
    completed: "completed",
    internal: "internal",
    closed: "closed",
    hide: "hide",
    undo: "undo",
}

export const RunningStatus = [
    Status.running,
    Status.internal,
    Status.closed,
  ];

export const CompletedStatus = [
    Status.won,
    Status.lose,
    Status.refund,
    Status.hide,
  ];
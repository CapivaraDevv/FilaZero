import { useState, useEffect } from "react";
import { queueAPI } from "../services/api.js";
import { getSocket, joinQueue, leaveQueue } from "../services/socketService.js";

export default function useQueue() {
    const [selectedEstablishment, setSelectedEstablishment] = useState("");
    const [queue, setQueue] = useState([]);
    const [stats, setStats] = useState({
        totalWaiting: 0,
        totalServed: 0,
        averageTime: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchQueueData = async () => {
        if (!selectedEstablishment) return;

        setLoading(true);
        try {
            const response = await queueAPI.getAllEntries(selectedEstablishment);
            setQueue(response.data.entries || []);
            setStats(response.data.stats || {});
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedEstablishment) return;

        fetchQueueData();

        const socket = getSocket();
        joinQueue(selectedEstablishment);

        socket.on("queue:update", fetchQueueData);
        socket.on("queue:called", fetchQueueData);
        socket.on("queue:served", fetchQueueData);

        return () => {
            socket.off("queue:update", fetchQueueData);
            socket.off("queue:called", fetchQueueData);
            socket.off("queue:served", fetchQueueData);
            leaveQueue(selectedEstablishment);
        };
    }, [selectedEstablishment]);

    const callNext = async () => {
        if (!selectedEstablishment) return;
        await queueAPI.callNext(selectedEstablishment);
        fetchQueueData();
    };

    const serveEntry = async (entryId) => {
        if (!selectedEstablishment) return;
        await queueAPI.serveEntry(selectedEstablishment, entryId);
        fetchQueueData();
    };

    const waitingQueue = queue.filter(e => e.status === "waiting");
    const calledEntries = queue.filter(e => e.status === "called");

    return {
        selectedEstablishment,
        setSelectedEstablishment,
        waitingQueue,
        calledEntries,
        stats,
        loading,
        error,
        callNext,
        serveEntry,
    };

}
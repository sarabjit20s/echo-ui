import * as React from 'react';

const DEFAULT_PORTAL_CONTAINER_ID = 'root';

type PortalType = {
  id: string;
  children: React.ReactNode;
  containerId: string;
};

type SubscriberCallback = (portals: PortalType[]) => void;

type PortalContextValue = {
  addContainer: (containerId: string) => void;
  removeContainer: (containerId: string) => void;
  addPortal: (portal: PortalType) => void;
  removePortal: (id: string, containerId: string) => void;
  subscribe: (containerId: string, callback: SubscriberCallback) => () => void;
};

const PortalContext = React.createContext<PortalContextValue | null>(null);

const usePortal = () => {
  const context = React.useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};

type PortalProviderProps = {
  children: React.ReactNode;
};

const PortalProvider = ({ children }: PortalProviderProps) => {
  const containersRef = React.useRef(new Map<string, boolean>());
  const portalsRef = React.useRef(new Map<string, PortalType>());
  const subscribersRef = React.useRef(
    new Map<string, Set<SubscriberCallback>>(),
  );

  /**
   * A function that notifies all subscribers of the containers that are
   * associated with the given container ID.
   */
  const notifySubscribers = React.useCallback((containerId: string) => {
    const subscribers = subscribersRef.current.get(containerId);
    if (subscribers) {
      for (const callback of subscribers) {
        callback(
          Array.from(portalsRef.current.values()).filter(
            p => p.containerId === containerId,
          ),
        );
      }
    }
  }, []);

  const addContainer = React.useCallback((id: string) => {
    if (containersRef.current.has(id)) {
      throw new Error(`PortalContainer with id '${id}' already exists.`);
    } else {
      containersRef.current.set(id, true);
    }
  }, []);

  const removeContainer = React.useCallback((id: string) => {
    if (!containersRef.current.has(id)) {
      return;
    }
    containersRef.current.delete(id);
  }, []);

  const addPortal = React.useCallback(
    (portal: PortalType) => {
      if (containersRef.current.has(portal.containerId)) {
        portalsRef.current.set(portal.id, portal);
        notifySubscribers(portal.containerId);
      } else {
        throw new Error(
          `PortalContainer with id '${portal.containerId}' does not exist.`,
        );
      }
    },
    [notifySubscribers],
  );

  const removePortal = React.useCallback(
    (id: string, containerId: string) => {
      if (containersRef.current.has(containerId)) {
        portalsRef.current.delete(id);
        notifySubscribers(containerId);
      } else {
        console.warn(
          `Attempted to remove portal with containerId '${id}', but it does not exist.`,
        );
      }
    },
    [notifySubscribers],
  );

  const unsubscribe = React.useCallback(
    (containerId: string, callback: SubscriberCallback) => {
      const subscribers = subscribersRef.current.get(containerId);
      if (subscribers) {
        subscribers.delete(callback);
        subscribersRef.current.set(containerId, subscribers);
      }
    },
    [],
  );

  const subscribe = React.useCallback(
    (containerId: string, callback: SubscriberCallback) => {
      const subscribers = subscribersRef.current.get(containerId) || new Set();
      subscribers.add(callback);
      subscribersRef.current.set(containerId, subscribers);
      // return a function to unsubscribe
      return () => {
        unsubscribe(containerId, callback);
      };
    },
    [unsubscribe],
  );

  return (
    <PortalContext.Provider
      value={{
        addContainer,
        removeContainer,
        addPortal,
        removePortal,
        subscribe,
      }}>
      {children}
      <PortalContainer id={DEFAULT_PORTAL_CONTAINER_ID} />
    </PortalContext.Provider>
  );
};

type PortalContainerProps = {
  id: string;
};
const PortalContainer = ({ id }: PortalContainerProps) => {
  const { addContainer, removeContainer, subscribe } = usePortal();
  const [portals, setPortals] = React.useState<PortalType[]>([]);

  React.useEffect(() => {
    addContainer(id);
    return () => {
      removeContainer(id);
    };
  }, [addContainer, removeContainer, id]);

  React.useEffect(() => {
    const unsubscribe = subscribe(id, portals => setPortals(portals));

    return () => {
      unsubscribe();
    };
  }, [subscribe, id]);

  return (
    <React.Fragment>
      {portals.map(p => (
        <React.Fragment key={p.id}>{p.children}</React.Fragment>
      ))}
    </React.Fragment>
  );
};

type PortalProps = {
  children?: React.ReactNode;
  /**
   * The ID of the container to which the portal will be added.
   */
  containerId?: string;
};

const Portal = ({
  children,
  containerId = DEFAULT_PORTAL_CONTAINER_ID,
}: PortalProps) => {
  const { addPortal, removePortal } = usePortal();
  const id = React.useId();

  React.useEffect(() => {
    addPortal({ id, children, containerId });
    return () => {
      removePortal(id, containerId);
    };
  }, [children, id, containerId, addPortal, removePortal]);

  return null;
};

export { Portal, PortalProvider, PortalContainer, DEFAULT_PORTAL_CONTAINER_ID };
export type { PortalProps, PortalProviderProps, PortalContainerProps };

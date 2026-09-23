import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Tabs } from 'twenty-ui/primitives/navigation';

import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledRoot = styled(Tabs.Root)`
  display: contents;
`;

// display: contents removes the box from the tree, which breaks height
// propagation to descendants that need a definite height (e.g. a
// container-type: size scroll area). This variant keeps a real flex box so the
// height flows through.
const StyledFillHeightRoot = styled(Tabs.Root)`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

type TabListRootProps = {
  componentInstanceId: string;
  children: ReactNode;
  enabled?: boolean;
  shouldFillHeight?: boolean;
};

export const TabListRoot = ({
  componentInstanceId,
  children,
  enabled = true,
  shouldFillHeight = false,
}: TabListRootProps) => {
  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    componentInstanceId,
  );

  const RootComponent = shouldFillHeight ? StyledFillHeightRoot : StyledRoot;

  return (
    <TabListComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      {enabled ? (
        <RootComponent value={activeTabId}>{children}</RootComponent>
      ) : (
        children
      )}
    </TabListComponentInstanceContext.Provider>
  );
};

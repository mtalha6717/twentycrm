import { TotpCodeDisplay } from '@/authenticator/components/TotpCodeDisplay';
import { useScreenQrCodeCapture } from '@/authenticator/hooks/useScreenQrCodeCapture';
import { type AuthenticatorFormValues } from '@/authenticator/types/AuthenticatorFormValues';
import { isValidBase32Secret } from '@/authenticator/utils/isValidBase32Secret';
import { normalizeBase32Secret } from '@/authenticator/utils/normalizeBase32Secret';
import { parseOtpauthUri } from '@/authenticator/utils/parseOtpauthUri';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { DialogInstance } from '@/ui/layout/dialog/components/DialogInstance';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { IconButton } from 'twenty-ui/components';
import { IconDeviceDesktop, IconPencil, IconX } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const CAPTURE_TAB_ID = 'capture-qr';
const MANUAL_TAB_ID = 'manual-entry';

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  height: 48px;
  justify-content: space-between;
  padding: 0 ${themeCssVariables.spacing[3]} 0 ${themeCssVariables.spacing[5]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledTabsContainer = styled.div`
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[5]};
`;

const StyledCaptureLayout = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
`;

const StyledCaptureControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledButtonRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHelpText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
`;

const StyledVideo = styled.video`
  aspect-ratio: 16 / 10;
  // Letterbox around a shared screen, black in both themes like a video player
  background: black;
  border-radius: ${themeCssVariables.border.radius.md};
  object-fit: contain;
  width: 100%;
`;

const StyledFieldGrid = styled.div`
  align-items: end;
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
`;

const StyledStatus = styled.div`
  background: ${themeCssVariables.tag.background.yellow};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.tag.text.yellow};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[5]};
`;

type AuthenticatorDialogProps = {
  dialogId: string;
  title: string;
  initialValues: AuthenticatorFormValues;
  onSubmit: (values: AuthenticatorFormValues) => Promise<void>;
  onClose: () => void;
};

export const AuthenticatorDialog = ({
  dialogId,
  title,
  initialValues,
  onSubmit,
  onClose,
}: AuthenticatorDialogProps) => {
  const tabsInstanceId = `${dialogId}-tabs`;

  const [otpauthUri, setOtpauthUri] = useState('');
  const [secret, setSecret] = useState(initialValues.secretSeed);
  const [label, setLabel] = useState(initialValues.authLabel);
  const [issuer, setIssuer] = useState(initialValues.issuer);
  const [previewSecret, setPreviewSecret] = useState(initialValues.secretSeed);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { enqueueToast } = useToast();

  const applyOtpauthUri = (uri: string) => {
    try {
      const parameters = parseOtpauthUri(uri);

      setOtpauthUri(uri);
      setSecret(parameters.secret);
      setPreviewSecret(parameters.secret);
      if (isNonEmptyString(parameters.issuer)) {
        setIssuer(parameters.issuer);
      }
      setLabel(
        [parameters.issuer, parameters.account]
          .filter(isNonEmptyString)
          .join(':') || label,
      );
      setStatus(t`Details filled in. Check the code below, then save.`);
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : t`Invalid otpauth URI`,
      );
    }
  };

  const { videoRef, isCapturing, startCapture, stopCapture } =
    useScreenQrCodeCapture({
      onOtpauthUriFound: applyOtpauthUri,
      onStatusChange: setStatus,
    });

  const handlePreview = () => {
    if (isNonEmptyString(otpauthUri.trim())) {
      applyOtpauthUri(otpauthUri.trim());
      return;
    }

    if (!isValidBase32Secret(secret)) {
      setStatus(t`Paste an otpauth URI or enter a valid base32 secret.`);
      return;
    }

    setPreviewSecret(normalizeBase32Secret(secret));
    setStatus('');
  };

  const handleClose = () => {
    stopCapture();
    onClose();
  };

  const canSave = isValidBase32Secret(previewSecret) && !isSaving;

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await onSubmit({
        authLabel: isNonEmptyString(label.trim()) ? label.trim() : issuer,
        issuer,
        secretSeed: previewSecret,
      });
      stopCapture();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: CAPTURE_TAB_ID, title: t`Capture QR`, Icon: IconDeviceDesktop },
    { id: MANUAL_TAB_ID, title: t`Manual entry`, Icon: IconPencil },
  ];

  return (
    <DialogInstance
      dialogId={dialogId}
      dismissible
      onClose={handleClose}
      renderInDocumentBody
    >
      {({ container, backdrop, viewportProps, onKeyDown }) => (
        <Dialog.Popup
          aria-label={title}
          {...{ container, backdrop, viewportProps, onKeyDown }}
          size="lg"
          style={{ padding: 0 }}
        >
          <StyledHeader>
            <StyledTitle>{title}</StyledTitle>
            <IconButton aria-label={t`Close`} onClick={handleClose} size="sm">
              <IconX />
            </IconButton>
          </StyledHeader>
          <TabListRoot componentInstanceId={tabsInstanceId}>
            <StyledTabsContainer>
              <TabList
                aria-label={title}
                tabs={tabs}
                behaveAsLinks={false}
                componentInstanceId={tabsInstanceId}
              />
            </StyledTabsContainer>
            <StyledBody>
              <Tabs.Panel value={CAPTURE_TAB_ID} keepMounted>
                <StyledCaptureLayout>
                  <StyledCaptureControls>
                    <StyledButtonRow>
                      <Button
                        variant="outline"
                        color="accent"
                        onClick={startCapture}
                        disabled={isCapturing}
                      >
                        {t`Start capture`}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={stopCapture}
                        disabled={!isCapturing}
                      >
                        {t`Stop`}
                      </Button>
                    </StyledButtonRow>
                    <StyledHelpText>
                      {t`Share the tab or window showing the QR code. Screen capture requires HTTPS or localhost.`}
                    </StyledHelpText>
                  </StyledCaptureControls>
                  <StyledVideo ref={videoRef} muted playsInline />
                </StyledCaptureLayout>
              </Tabs.Panel>
              <Tabs.Panel value={MANUAL_TAB_ID}>
                <StyledBody style={{ padding: 0 }}>
                  <TextArea
                    textAreaId={`${dialogId}-otpauth-uri`}
                    label={t`otpauth URI`}
                    placeholder="otpauth://totp/Issuer:account?secret=..."
                    minRows={3}
                    value={otpauthUri}
                    onChange={setOtpauthUri}
                  />
                  <StyledFieldGrid>
                    <TextInput
                      label={t`Raw base32 secret`}
                      value={secret}
                      onChange={setSecret}
                      fullWidth
                    />
                    <TextInput
                      label={t`Label`}
                      value={label}
                      onChange={setLabel}
                      fullWidth
                    />
                    <TextInput
                      label={t`Issuer`}
                      value={issuer}
                      onChange={setIssuer}
                      fullWidth
                    />
                    <div>
                      <Button variant="outline" onClick={handlePreview}>
                        {t`Preview`}
                      </Button>
                    </div>
                  </StyledFieldGrid>
                </StyledBody>
              </Tabs.Panel>
              {isNonEmptyString(status) && (
                <StyledStatus>{status}</StyledStatus>
              )}
            </StyledBody>
          </TabListRoot>
          <StyledFooter>
            <TotpCodeDisplay secret={previewSecret} size="lg" />
            <StyledButtonRow>
              <Button variant="outline" onClick={handleClose}>
                {t`Cancel`}
              </Button>
              <Button
                variant="solid"
                color="accent"
                onClick={handleSave}
                disabled={!canSave}
                loading={isSaving}
              >
                {t`Save authenticator`}
              </Button>
            </StyledButtonRow>
          </StyledFooter>
        </Dialog.Popup>
      )}
    </DialogInstance>
  );
};

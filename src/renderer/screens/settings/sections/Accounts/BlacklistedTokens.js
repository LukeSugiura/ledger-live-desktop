// @flow
import {
  SettingsSection as Section,
  SettingsSectionHeader as Header,
} from "~/renderer/screens/settings/SettingsSection";
import IconBan from "~/renderer/icons/Ban";
import Text from "~/renderer/components/Text";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { findTokenById } from "@ledgerhq/live-common/lib/currencies";
import CryptoCurrencyIcon from "~/renderer/components/CryptoCurrencyIcon";
import Box from "~/renderer/components/Box";
import styled from "styled-components";
import IconCross from "~/renderer/icons/Cross";
import { useDispatch, useSelector } from "react-redux";
import { showToken } from "~/renderer/actions/settings";
import { blacklistedTokenIdsSelector } from "~/renderer/reducers/settings";
import { useBridgeSync } from "@ledgerhq/live-common/lib/bridge/react";
import type { ThemedComponent } from "~/renderer/styles/StyleProvider";

export default function BlacklistedTokens() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sync = useBridgeSync();

  // Trigger a sync on unmounting the block
  useEffect(() => () => sync({ type: "SYNC_ALL_ACCOUNTS", priority: 5 }), [sync]);

  const onShowToken = useCallback(
    tokenId => {
      dispatch(showToken(tokenId));
    },
    [dispatch],
  );

  const blacklistedTokenIds = useSelector(blacklistedTokenIdsSelector);
  console.log('!!!', blacklistedTokenIds)
  const sections = [];
  for (const tokenId of blacklistedTokenIds) {
    const token = findTokenById(tokenId);
    if (token) {
      const parentCurrency = token.parentCurrency;
      const index = sections.findIndex(s => s.parentCurrency === parentCurrency);
      if (index < 0) {
        sections.push({
          parentCurrency,
          tokens: [token],
        });
      } else {
        sections[index].tokens.push(token);
      }
    }
  }

  return (
    <Section mt={20} style={{ flowDirection: "column" }}>
      <Header
        icon={<IconBan />}
        title={t("settings.accounts.tokenBlacklist.title")}
        desc={t("settings.accounts.tokenBlacklist.desc")}
      />
      <div>
        {sections.map(({ parentCurrency, tokens }) => (
          <Box key={parentCurrency.id}>
            <BlacklistedTokensSectionHeader>
              <Text ff="Inter|Bold" fontSize={2} color="palette.text.shade40">
                {parentCurrency.name}
              </Text>
            </BlacklistedTokensSectionHeader>
            <Body>
              {tokens.map(token => (
                <BlacklistedTokenRow key={token.id}>
                  <CryptoCurrencyIcon currency={token} size={20} />
                  <Text
                    style={{ marginLeft: 10, flex: 1 }}
                    ff="Inter|Medium"
                    color="palette.text.shade100"
                    fontSize={3}
                  >
                    {token.name}
                  </Text>
                  <IconContainer onClick={() => onShowToken(token.id)}>
                    <IconCross size={16} />
                  </IconContainer>
                </BlacklistedTokenRow>
              ))}
            </Body>
          </Box>
        ))}
      </div>
    </Section>
  );
}

const IconContainer: ThemedComponent<{}> = styled.div`
  color: ${p => p.theme.colors.palette.text.shade60};
  text-align: center;
  &:hover {
    cursor: pointer;
    color: ${p => p.theme.colors.palette.text.shade40};
  }
`;

const BlacklistedTokenRow: ThemedComponent<{}> = styled(Box).attrs({
  alignItems: "center",
  horizontal: true,
  flow: 1,
  py: 1,
})`
  margin: 0px;
  &:not(:last-child) {
    border-bottom: 1px solid ${p => p.theme.colors.palette.text.shade10};
  }
  padding: 14px 6px;
`;

const Body: ThemedComponent<{}> = styled(Box)`
  &:not(:empty) {
    padding: 0 20px;
  }
`;

const BlacklistedTokensSectionHeader: ThemedComponent<{}> = styled.div`
  background: ${p => p.theme.colors.palette.background.default};
  margin: 0 20px;
  padding: 2px 12px;
  border-radius: 4px;
  text-transform: uppercase;
  & > * {
    letter-spacing: 0.1em;
  }
`;

import { gettext } from "i18n";

function Settings(props) {
  return (
    <Page>
      <Section title={<Text></Text>}>
      </Section>
      <Section title={<Text></Text>}>
        <Text bold align="center">{gettext("clockface_settings")}</Text>
      </Section>
      <Section title={<Text></Text>}>
        <Text>{gettext("color")}</Text>
        <ColorSelect
          settingsKey="color"
          colors={[
            {color: 'navy'},
            {color: 'blue'},
            {color: 'aqua'},
            {color: 'teal'},
            {color: 'lime'},
            {color: 'yellow'},
            {color: 'maroon'},
            {color: 'fuchsia'},
            {color: 'purple'},
            {color: 'gray'},
            {color: 'silver'},
            {color: 'white'},
          ]}
          centered
        />
      </Section>
      <Section description={<Text></Text>}>
        <Text bold align="center">{gettext("help")}</Text>
      </Section>
      <Section title={<Text></Text>}>
        <Text>{gettext("helpl1")}</Text>
        <Text>{gettext("helpl2")}</Text>
      </Section>
      <Section title={<Text></Text>}>
        <Text bold align="center">{gettext("contact")}</Text>
      </Section>
      <Section title={<Text></Text>}>
        <Text>{gettext("contacttxt")}</Text>
        <Link source="https://github.com/lemnet/SimpleWeather">https://github.com/lemnet/SimpleWeather</Link>
      </Section>
      <Section title={<Text></Text>}>
        <Text bold align="center">{gettext("licences")}</Text>
      </Section>
      <Section title={<Text></Text>}>
        <Text>{gettext("lic_ori_idea")}</Text>
        <Link source="https://apps.rebble.io/en_US/application/5599a73fe47bb388a7000056">{gettext("lic_ori_idea_link")}</Link>
      </Section>
      <Section title={<Text></Text>}>
        <Text>{gettext("lic_fitbit")}<Link source="https://github.com/Fitbit/sdk-design-assets">Fitbit SDK - Design Assets</Link></Text>
        <Link source="https://raw.githubusercontent.com/Fitbit/sdk-design-assets/master/LICENCE.txt">{gettext("licence")}</Link>
      </Section>
      <Section title={<Text></Text>}>
        <Text>{gettext("lic_weather")} <Link source="https://techbase.kde.org/Projects/Oxygen">KDE Oxygen Projects</Link></Text>
        <Link source="https://raw.githubusercontent.com/lemnet/SimpleWeather/main/resources/icons/weather/lgpl-3.0.txt">{gettext("licence")}</Link>
      </Section>
    </Page>
  );
}

registerSettingsPage(Settings);
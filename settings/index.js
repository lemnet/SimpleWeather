function Settings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Clockface settings</Text>}>
        <Text>Color : </Text>
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
        />
      </Section>
      <Section
        title={<Text bold align="center">Contact</Text>}>
        <Link source="https://github.com/lemnet/SimpleWeather">https://github.com/lemnet/SimpleWeather</Link>
      </Section>
    </Page>
  );
}

registerSettingsPage(Settings);
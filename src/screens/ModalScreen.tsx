import React, { useState } from "react";
import { View } from "react-native";
import {
  Button,
  Colors,
  Dialog,
  Portal,
  TextInput,
  HelperText,
  IconButton,
} from "react-native-paper";

interface Props {
  onAdd: () => void;
  onCancel: () => void;
  onSave: (name: string) => void;
  isSlector: boolean;
  selectedLength: number;
}

const ModaleScreen = ({
  onAdd,
  onSave,
  isSlector,
  selectedLength,
  onCancel,
}: Props) => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState("");
  const [erroPress, setErroPress] = React.useState(false);
  const hideDialog = () => {
    setVisible(false);
    setError("");
    setText("");
  };
  const onSubmit = () => {
    if (text.length == 0) {
      setError("Please enter a name");
    } else {
      onSave(text);
      hideDialog();
    }
  };

  React.useEffect(() => {
    if (!!erroPress && selectedLength > 0) setErroPress(false);
  }, [selectedLength]);

  const onPreesIcon = () => {
    if (selectedLength > 0) setVisible(true);
    else setErroPress(true);
  };

  const onClose = () => {
    onCancel();
    hideDialog();
  };

  return (
    <>
      {!isSlector ? (
        <IconButton
          icon="plus-circle"
          color={Colors.green400}
          size={50}
          onPress={() => onAdd()}
        />
      ) : (
        <View>
          <Button
            onPress={onPreesIcon}
            color={Colors.green300}
            mode="contained"
            style={{
              padding: 10,
              margin: 5,
            }}
          >
            Save
          </Button>
          <Button
            onPress={onClose}
            color={Colors.red900}
            mode="outlined"
            style={{
              padding: 10,
              margin: 5,
            }}
          >
            Cancel
          </Button>

          <HelperText
            type="error"
            visible={erroPress}
            style={{
              fontSize: 18,
            }}
          >
            you must select at least one contact
          </HelperText>
        </View>
      )}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>Create a groupe</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Group name"
              value={text}
              onChangeText={(text) => setText(text)}
              error={!!error}
            />
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog} color={Colors.red500}>
              Cancel
            </Button>
            <Button onPress={onSubmit} mode="contained" color={Colors.green100}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default ModaleScreen;

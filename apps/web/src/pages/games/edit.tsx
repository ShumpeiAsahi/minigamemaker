import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Image,
  Input,
  FormLabel,
  Icon,
  Center,
  Select,
  Button,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { Editor } from "../../../../../packages/runtime/src/editor";
import { useEffect, useRef } from "react";
import gameData from "../../assets/sample-game.json";
import type { GameJSON } from "../../../../../packages/runtime/src/types";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { FaImage, FaPlus, FaTrash } from "react-icons/fa";
import {
  buildActionFormLabel,
  buildEventFormLabel,
  buildEventFormValue,
} from "../../utils/events";
import { AddEventButton } from "../../components/AddEventButton";
import { TriggerSelect } from "../../components/TriggerSelect";
import { ActionSelect } from "../../components/ActionSelect";

export default function Edit() {
  const mountRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const methods = useForm<GameJSON>({
    defaultValues: gameData,
    // defaultValues: defaultValues,
  });

  const objects = useWatch({
    control: methods.control,
    name: "objects",
  }) as GameJSON["objects"];
  const assets = useWatch({
    control: methods.control,
    name: "assets",
  }) as GameJSON["assets"];
  const events = useWatch({
    control: methods.control,
    name: "events",
  }) as GameJSON["events"];

  // エディタの初期化
  useEffect(() => {
    if (!mountRef.current) return;
    editorRef.current = new Editor(
      methods.getValues(),
      mountRef.current,
      (id, x, y) => {
        methods.setValue(`objects.${id}.x`, x);
        methods.setValue(`objects.${id}.y`, y);
      },
    );
    editorRef.current.init();
  }, []);

  // アセットとオブジェクトの変更を監視してエディタを更新
  useEffect(() => {
    if (!editorRef.current) return;
    const currentValues = methods.getValues();
    const hasAssetChanges = currentValues.assets.some(
      (asset, index) =>
        asset.id !== gameData.assets[index]?.id ||
        asset.url !== gameData.assets[index]?.url,
    );
    const hasObjectChanges =
      currentValues.objects.length !== gameData.objects.length;
    if (hasAssetChanges || hasObjectChanges) {
      editorRef.current.updateGameJSON(currentValues);
    }
  }, [assets, objects]);

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    formIndex: number,
    objectIndex: number,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルをBase64に変換
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (!base64) return;

      // 新しいアセットIDを生成
      const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 現在のアセットとオブジェクトを取得
      const currentAssets = methods.getValues("assets");
      const currentObjects = methods.getValues("objects");

      // 新しいアセットを追加
      methods.setValue("assets", [
        ...currentAssets,
        {
          id: assetId,
          name: file.name,
          url: base64,
        },
      ]);

      // フォームのasset_idを更新
      methods.setValue(
        `objects.${objectIndex}.forms.${formIndex}.asset_id`,
        assetId,
      );
    };
    reader.readAsDataURL(file);
  };

  const addForm = (objectIndex: number) => {
    const currentForms = methods.getValues(`objects.${objectIndex}.forms`);
    if (currentForms.length >= 4) return;

    methods.setValue(`objects.${objectIndex}.forms`, [
      ...currentForms,
      {
        index: currentForms.length,
        name: `フォーム${currentForms.length + 1}`,
      },
    ]);
  };

  const removeForm = (objectIndex: number, formIndex: number) => {
    const currentForms = methods.getValues(`objects.${objectIndex}.forms`);
    const newForms = currentForms.filter((_, index) => index !== formIndex);

    // インデックスを振り直す
    const updatedForms = newForms.map((form, index) => ({
      ...form,
      index,
    }));

    methods.setValue(`objects.${objectIndex}.forms`, updatedForms);
  };

  const addObject = () => {
    const currentObjects = methods.getValues("objects");
    if (currentObjects.length >= 16) return;

    const newObjectId = `object_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    methods.setValue("objects", [
      ...currentObjects,
      {
        id: newObjectId,
        name: `オブジェクト${currentObjects.length + 1}`,
        forms: [
          {
            index: 0,
            name: "フォーム1",
          },
        ],
        x: 0,
        y: 0,
        anchor: 0,
        interactive: true,
      },
    ]);
  };

  const removeObject = (objectIndex: number) => {
    const currentObjects = methods.getValues("objects");
    const newObjects = currentObjects.filter(
      (_, index) => index !== objectIndex,
    );
    methods.setValue("objects", newObjects);
  };

  return (
    <FormProvider {...methods}>
      <Box
        width="100%"
        maxW="540px"
        mx="auto"
        position="relative"
        sx={{
          "& canvas": {
            width: "100% !important",
            height: "auto !important",
            display: "block",
          },
        }}
      >
        <VStack spacing={4} align="stretch">
          <Heading size="lg">ゲームエディタ</Heading>

          <HStack justify="space-between" align="center">
            <Heading size="md">オブジェクト</Heading>
            {objects.length < 16 && (
              <Button
                leftIcon={<Icon as={FaPlus} />}
                size="sm"
                onClick={addObject}
              >
                オブジェクトを追加
              </Button>
            )}
          </HStack>

          <Accordion allowMultiple>
            {objects.map((object, index) => (
              <AccordionItem key={object.id}>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      {object.name}
                    </Box>
                    <HStack spacing={2}>
                      {objects.length > 1 && (
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeObject(index);
                          }}
                        >
                          <Icon as={FaTrash} />
                        </Button>
                      )}
                      <AccordionIcon />
                    </HStack>
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Box mb={4}>
                    <FormLabel htmlFor={`objects.${index}.name`}>
                      名前
                    </FormLabel>
                    <Input
                      id={`objects.${index}.name`}
                      {...methods.register(`objects.${index}.name`)}
                    />
                  </Box>
                  {object.forms.map((form, formIndex) => {
                    const assetUrl = methods
                      .getValues()
                      .assets.find((asset) => asset.id === form.asset_id)?.url;
                    return (
                      <Box key={form.index} mb={4}>
                        <HStack justify="space-between" mb={2}>
                          <Text>{`フォーム${form.index + 1}`}</Text>
                          {object.forms.length > 1 && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeForm(index, formIndex)}
                            >
                              <Icon as={FaTrash} />
                            </Button>
                          )}
                        </HStack>
                        <Box position="relative" mb={2}>
                          {assetUrl ? (
                            <Image src={assetUrl} alt={form.name} w="100px" />
                          ) : (
                            <Center
                              w="100px"
                              h="100px"
                              bg="gray.100"
                              borderRadius="md"
                              border="1px dashed"
                              borderColor="gray.300"
                              cursor="pointer"
                              _hover={{ bg: "gray.200" }}
                            >
                              <Icon as={FaImage} w={8} h={8} color="gray.400" />
                            </Center>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            position="absolute"
                            top="0"
                            left="0"
                            w="100px"
                            h="100px"
                            opacity="0"
                            cursor="pointer"
                            onChange={(e) =>
                              handleImageUpload(e, formIndex, index)
                            }
                          />
                        </Box>
                        <FormLabel
                          htmlFor={`objects.${index}.forms.${formIndex}.asset_id`}
                        >
                          アセット
                        </FormLabel>
                        <Select
                          id={`objects.${index}.forms.${formIndex}.asset_id`}
                          {...methods.register(
                            `objects.${index}.forms.${formIndex}.asset_id`,
                          )}
                          value={form.asset_id}
                        >
                          <option value="">アセットを選択</option>
                          {assets.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              {asset.name}
                            </option>
                          ))}
                        </Select>
                      </Box>
                    );
                  })}
                  {object.forms.length < 4 && (
                    <Button
                      leftIcon={<Icon as={FaPlus} />}
                      size="sm"
                      onClick={() => addForm(index)}
                      mb={4}
                    >
                      フォームを追加
                    </Button>
                  )}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
          <HStack justify="space-between" align="center">
            <Heading size="md">イベント</Heading>
            <AddEventButton
              onAdd={(newEvent) => {
                const currentEvents = methods.getValues("events");
                methods.setValue("events", [...currentEvents, newEvent]);
              }}
            />
          </HStack>

          <Accordion allowMultiple>
            {events.map((event, index) => {
              const eventTypeLabel = buildEventFormLabel(event, objects);
              return (
                <AccordionItem key={index}>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        {eventTypeLabel}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <FormLabel>トリガー</FormLabel>
                        <TriggerSelect
                          value={event.trigger.type}
                          onChange={(type) => {
                            const currentEvents = methods.getValues("events");
                            const updatedEvent = {
                              ...event,
                              trigger: {
                                type,
                                ...(type === "time"
                                  ? { at: 0 }
                                  : { targetId: "" }),
                              },
                            };
                            currentEvents[index] = updatedEvent;
                            methods.setValue("events", currentEvents);
                          }}
                        />
                      </Box>
                      {event.trigger.type === "time" && (
                        <Box>
                          <FormLabel>時間（秒）</FormLabel>
                          <Input
                            type="number"
                            value={event.trigger.at / 1000}
                            onChange={(e) => {
                              const currentEvents = methods.getValues("events");
                              const updatedEvent = {
                                ...event,
                                trigger: {
                                  ...event.trigger,
                                  at: Number(e.target.value) * 1000,
                                },
                              };
                              currentEvents[index] = updatedEvent;
                              methods.setValue("events", currentEvents);
                            }}
                          />
                        </Box>
                      )}
                      {event.trigger.type === "click" && (
                        <Box>
                          <FormLabel>対象オブジェクト</FormLabel>
                          <Select
                            value={event.trigger.targetId}
                            onChange={(e) => {
                              const currentEvents = methods.getValues("events");
                              const updatedEvent = {
                                ...event,
                                trigger: {
                                  ...event.trigger,
                                  targetId: e.target.value,
                                },
                              };
                              currentEvents[index] = updatedEvent;
                              methods.setValue("events", currentEvents);
                            }}
                          >
                            <option value="">オブジェクトを選択</option>
                            {objects.map((object) => (
                              <option key={object.id} value={object.id}>
                                {object.name}
                              </option>
                            ))}
                          </Select>
                        </Box>
                      )}
                      <Box>
                        <FormLabel>アクション</FormLabel>
                        <ActionSelect
                          value={event.actions[0].type as ActionType}
                          onChange={(type) => {
                            const currentEvents = methods.getValues("events");
                            const updatedEvent = {
                              ...event,
                              actions: [
                                {
                                  type,
                                  target: "",
                                },
                              ],
                            };
                            currentEvents[index] = updatedEvent;
                            methods.setValue("events", currentEvents);
                          }}
                        />
                      </Box>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>

          <Box ref={mountRef} />
        </VStack>
      </Box>
    </FormProvider>
  );
}

const defaultValues: GameJSON = {
  meta: { width: 540, height: 960, bgColor: "#1099bb", loopMs: 4000 },
  assets: [],
  objects: [
    {
      id: "object1",
      name: "オブジェクト1",
      forms: [
        {
          index: 0,
          name: "フォーム1",
        },
      ],
      x: 0,
      y: 0,
      anchor: 0.5,
      interactive: true,
    },
  ],
  events: [],
};

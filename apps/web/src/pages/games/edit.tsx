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
import { MicroGame } from "../../../../../packages/runtime/src";
import { useEffect, useRef, useState } from "react";
import type { GameJSON } from "../../../../../packages/runtime/src/types";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { FaImage, FaPlus, FaTrash } from "react-icons/fa";
import { buildEventFormLabel } from "../../utils/events";
import { AddEventButton } from "../../components/AddEventButton";
import { TriggerSelect } from "../../components/TriggerSelect";
import { ActionSelect } from "../../components/ActionSelect";
import { ActionSettings } from "../../components/ActionSettings";

export default function Edit() {
  const mountRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const methods = useForm<GameJSON>({
    defaultValues: defaultValues,
  });

  const objects = useWatch({ control: methods.control, name: "objects" });
  const assets = useWatch({ control: methods.control, name: "assets" });
  const events = useWatch({ control: methods.control, name: "events" });

  // エディタの初期化
  useEffect(() => {
    if (!mountRef.current) return;
    editorRef.current = new Editor(
      methods.getValues(),
      mountRef.current,
      (id, x, y) => {
        const objectIndex = methods
          .getValues("objects")
          .findIndex((object) => object.id === id);
        if (objectIndex === -1) return;
        methods.setValue(`objects.${objectIndex}.x`, x);
        methods.setValue(`objects.${objectIndex}.y`, y);
      },
    );
    editorRef.current.init();
  }, []);

  // アセットとオブジェクトの変更を監視してエディタを更新
  useEffect(() => {
    if (!editorRef.current) return;
    const currentValues = methods.getValues();
    console.log(currentValues);
    const hasAssetChanges = currentValues.assets.some(
      (asset, index) =>
        asset.id !== defaultValues.assets[index]?.id ||
        asset.url !== defaultValues.assets[index]?.url,
    );
    const hasObjectChanges =
      currentValues.objects.length !== defaultValues.objects.length;
    if (hasAssetChanges || hasObjectChanges) {
      editorRef.current.updateGameJSON(currentValues);
    }
  }, [assets, objects]);

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    formIndex: number,
    objectIndex: number,
  ) => {
    console.log("handleImageUpload", event, formIndex, objectIndex);
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

      // フォームのasset_idsを更新
      const currentAssetIds =
        methods.getValues(`objects.${objectIndex}.forms.0.asset_ids`) || [];
      methods.setValue(`objects.${objectIndex}.forms.0.asset_ids`, [
        ...currentAssetIds,
        assetId,
      ]);
    };
    reader.readAsDataURL(file);
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
        type: "asset",
        forms: [
          {
            index: 0,
            name: "フォーム1",
            asset_ids: [],
          },
        ],
        x: 0,
        y: 0,
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

  const handlePreview = async () => {
    console.log("handlePreview");
    if (!previewRef.current) return;
    setIsPreviewMode(true);
    console.log(methods.getValues());
    const game = new MicroGame(methods.getValues(), previewRef.current);
    await game.ready();
    game.run(false);
  };

  const handleStopPreview = () => {
    setIsPreviewMode(false);
    if (previewRef.current) {
      previewRef.current.innerHTML = "";
    }
  };

  const handleActionChange = (eventIndex: number, type: string) => {
    const currentEvents = methods.getValues("events");
    const updatedEvent = {
      ...currentEvents[eventIndex],
      actions: [
        {
          type,
          target: "",
          ...(type === "tween" && {
            to: { x: 0, y: 0 },
            dur: 1000,
          }),
        },
      ],
    };
    currentEvents[eventIndex] = updatedEvent;
    methods.setValue("events", currentEvents);
  };

  const handleActionSettingsChange = (eventIndex: number, settings: any) => {
    const currentEvents = methods.getValues("events");
    const updatedEvent = {
      ...currentEvents[eventIndex],
      actions: [
        {
          ...currentEvents[eventIndex].actions[0],
          ...settings,
        },
      ],
    };
    currentEvents[eventIndex] = updatedEvent;
    methods.setValue("events", currentEvents);
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
            <Heading size="md">基本設定</Heading>
          </HStack>
          <Box>
            <FormLabel>ゲームタイトル</FormLabel>
            <Input {...methods.register("meta.title")} />
            <FormLabel>ユーザー名</FormLabel>
            <Input {...methods.register("meta.user.name")} />
            <FormLabel mt={4}>背景画像</FormLabel>
            <Box position="relative" mb={2}>
              <VStack spacing={2} align="stretch">
                {(() => {
                  const bgImage = methods
                    .getValues()
                    .assets.find((a) => a.id === "bgImage");
                  if (bgImage) {
                    return (
                      <HStack spacing={2}>
                        <Image
                          src={bgImage.url}
                          alt="背景画像"
                          w="200px"
                          h="auto"
                          objectFit="contain"
                        />
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => {
                            const currentAssets = methods.getValues("assets");
                            methods.setValue(
                              "assets",
                              currentAssets.filter((a) => a.id !== "bgImage"),
                            );
                          }}
                        >
                          <Icon as={FaTrash} />
                        </Button>
                      </HStack>
                    );
                  }
                  return (
                    <Box position="relative">
                      <Center
                        w="200px"
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
                      <Input
                        type="file"
                        accept="image/*"
                        position="absolute"
                        top="0"
                        left="0"
                        w="200px"
                        h="100px"
                        opacity="0"
                        cursor="pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const base64 = e.target?.result as string;
                            if (!base64) return;

                            const currentAssets = methods.getValues("assets");
                            const existingBgImage = currentAssets.find(
                              (a) => a.id === "bgImage",
                            );

                            if (existingBgImage) {
                              // 既存の背景画像を更新
                              methods.setValue(
                                "assets",
                                currentAssets.map((a) =>
                                  a.id === "bgImage"
                                    ? { ...a, url: base64, name: file.name }
                                    : a,
                                ),
                              );
                            } else {
                              // 新しい背景画像を追加
                              methods.setValue("assets", [
                                ...currentAssets,
                                {
                                  id: "bgImage",
                                  name: file.name,
                                  url: base64,
                                },
                              ]);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </Box>
                  );
                })()}
              </VStack>
            </Box>
          </Box>
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

                  <Box mb={4}>
                    <FormLabel htmlFor={`objects.${index}.type`}>
                      タイプ
                    </FormLabel>
                    <Select
                      id={`objects.${index}.type`}
                      {...methods.register(`objects.${index}.type`)}
                      value={object.type}
                    >
                      <option value="asset">アセット</option>
                      <option value="text">テキスト</option>
                    </Select>
                  </Box>

                  {object.type === "text" ? (
                    <>
                      <Box mb={4}>
                        <FormLabel htmlFor={`objects.${index}.text`}>
                          テキスト
                        </FormLabel>
                        <Input
                          id={`objects.${index}.text`}
                          {...methods.register(`objects.${index}.text`)}
                        />
                      </Box>
                      <Box mb={4}>
                        <FormLabel htmlFor={`objects.${index}.style.fontSize`}>
                          フォントサイズ
                        </FormLabel>
                        <Input
                          id={`objects.${index}.style.fontSize`}
                          type="number"
                          {...methods.register(
                            `objects.${index}.style.fontSize`,
                            {
                              valueAsNumber: true,
                            },
                          )}
                        />
                      </Box>
                      <Box mb={4}>
                        <FormLabel htmlFor={`objects.${index}.style.fill`}>
                          色
                        </FormLabel>
                        <Input
                          id={`objects.${index}.style.fill`}
                          type="color"
                          {...methods.register(`objects.${index}.style.fill`)}
                        />
                      </Box>
                    </>
                  ) : (
                    <Box mb={4}>
                      <Box position="relative" mb={2}>
                        <VStack spacing={2} align="stretch">
                          {object.forms[0]?.asset_ids?.map(
                            (assetId, assetIndex) => (
                              <HStack key={assetId} spacing={2}>
                                <Image
                                  src={
                                    methods
                                      .getValues()
                                      .assets.find(
                                        (asset) => asset.id === assetId,
                                      )?.url
                                  }
                                  alt={`アセット${assetIndex + 1}`}
                                  w="100px"
                                />
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    const currentAssetIds = methods.getValues(
                                      `objects.${index}.forms.0.asset_ids`,
                                    );
                                    methods.setValue(
                                      `objects.${index}.forms.0.asset_ids`,
                                      currentAssetIds.filter(
                                        (id: string) => id !== assetId,
                                      ),
                                    );
                                  }}
                                >
                                  <Icon as={FaTrash} />
                                </Button>
                              </HStack>
                            ),
                          )}
                        </VStack>
                        <Box position="relative" mt={2}>
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
                            onChange={(e) => handleImageUpload(e, 0, index)}
                          />
                        </Box>
                      </Box>
                      <FormLabel>アセット</FormLabel>
                      <Text fontSize="sm" color="gray.500">
                        画像をアップロードするか、既存のアセットを選択してください
                      </Text>
                    </Box>
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
                          value={event.actions[0].type}
                          onChange={(type) => handleActionChange(index, type)}
                        />
                        <Box mt={4}>
                          <ActionSettings
                            type={event.actions[0].type}
                            value={event.actions[0]}
                            objects={objects}
                            onChange={(settings) =>
                              handleActionSettingsChange(index, settings)
                            }
                          />
                        </Box>
                      </Box>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
          <HStack justify="space-between">
            {!isPreviewMode ? (
              <Button onClick={handlePreview}>ゲームを再生</Button>
            ) : (
              <Button onClick={handleStopPreview}>プレビューを停止</Button>
            )}
          </HStack>
          <Box ref={previewRef} />
          <Box ref={mountRef} />
        </VStack>
      </Box>
    </FormProvider>
  );
}

const defaultValues: GameJSON = {
  meta: {
    width: 540,
    height: 960,
    bgColor: "#1099bb",
    loopMs: 4000,
    title: "",
    user: { name: "", id: null },
  },
  assets: [],
  objects: [
    {
      id: "object1",
      name: "オブジェクト1",
      type: "asset",
      forms: [
        {
          index: 0,
          name: "フォーム1",
          asset_ids: [],
        },
      ],
      x: 0,
      y: 0,
    },
  ],
  events: [],
};

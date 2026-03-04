import { useMemo, useState } from 'react'

import { RenderConfigScreenCtx } from 'datocms-plugin-sdk'
import {
  Canvas,
  Form,
  SelectField,
  FieldGroup,
  Button,
  Spinner,
} from 'datocms-react-ui'
import {
  GlobalParameters,
  PageTypeOption,
  PlacementOption,
  MenuItemPlacementOption,
} from '../../lib/types'
import { pageTypeOptions, placementOptions } from '../../lib/constants'
import { getMenuItemPlacements } from '../../lib/helpers'
import { migrateSvgsToRecords, createSvgModel } from '../../lib/modelHelpers'

type Props = {
  ctx: RenderConfigScreenCtx
}

export default function ConfigScreen({ ctx }: Props) {
  const pluginParameters: GlobalParameters = ctx.plugin.attributes.parameters
  const [isMigrating, setIsMigrating] = useState(false)
  const [isCreatingModel, setIsCreatingModel] = useState(false)

  const selectedPageType = pluginParameters?.pageType || pageTypeOptions[0]
  const selectedPlacement = pluginParameters?.placement || placementOptions[0]

  const selectedMenuItemPlacement = useMemo(() => {
    return (
      pluginParameters?.menuItemPlacement ||
      getMenuItemPlacements(selectedPageType.value)[0]
    )
  }, [pluginParameters?.menuItemPlacement, selectedPageType.value])

  function saveSettings(settingToSave: Partial<GlobalParameters>) {
    ctx.updatePluginParameters({
      ...pluginParameters,
      ...settingToSave,
    })
    ctx.notice('Settings updated successfully!')
  }

  const handleMigration = async () => {
    const svgsToMigrate = pluginParameters.svgs || []

    if (svgsToMigrate.length === 0) {
      ctx.alert('No SVGs to migrate!')
      return
    }

    if (!pluginParameters.svgModelId) {
      ctx.alert('SVG model not found! Please complete setup first.')
      return
    }

    const confirmed = await ctx.openConfirm({
      title: 'Migrate SVGs to Records',
      content: `This will migrate ${svgsToMigrate.length} SVG(s) from plugin parameters to records. This action cannot be undone. Continue?`,
      choices: [
        {
          label: 'Migrate',
          value: 'migrate',
          intent: 'positive',
        },
        {
          label: 'Cancel',
          value: 'cancel',
          intent: 'negative',
        },
      ],
      cancel: {
        label: 'Cancel',
        value: 'cancel',
      },
    })

    if (confirmed !== 'migrate') {
      return
    }

    setIsMigrating(true)

    try {
      await migrateSvgsToRecords(
        ctx.currentUserAccessToken!,
        pluginParameters.svgModelId,
        svgsToMigrate,
      )

      // Clear the parameter-based SVGs after successful migration
      await ctx.updatePluginParameters({
        ...pluginParameters,
        svgs: [],
      })

      ctx.notice(
        `Successfully migrated ${svgsToMigrate.length} SVG(s) to records!`,
      )
    } catch (error) {
      console.error('Migration error:', error)
      ctx.alert(
        `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    } finally {
      setIsMigrating(false)
    }
  }

  const hasParameterSvgs =
    pluginParameters.svgs && pluginParameters.svgs.length > 0

  const handleCreateModel = async () => {
    if (!ctx.currentUserAccessToken) {
      ctx.alert(
        'Authentication token not available. Please reload the page and try again.',
      )
      return
    }

    setIsCreatingModel(true)

    try {
      const apiToken = ctx.currentUserAccessToken

      if (!apiToken) {
        ctx.alert(
          'API token not available. You may need to configure this manually.',
        )
        return
      }

      // Only pass environment if it's not a UI navigation state
      const envToPass =
        ctx.environment && !ctx.environment.includes('navigation')
          ? ctx.environment
          : undefined

      const model = await createSvgModel(apiToken, envToPass)

      // Update plugin parameters with the model ID
      await ctx.updatePluginParameters({
        ...pluginParameters,
        svgModelId: model.id,
        isSetupComplete: true,
      })

      ctx.notice('SVG model created successfully!')
    } catch (err) {
      console.error('Error creating model:', err)
      ctx.alert(
        err instanceof Error ? err.message : 'Failed to create SVG model',
      )
    } finally {
      setIsCreatingModel(false)
    }
  }

  // If setup is not complete, show setup UI
  if (!pluginParameters.isSetupComplete) {
    const handleMarkComplete = async () => {
      await ctx.updatePluginParameters({
        ...pluginParameters,
        isSetupComplete: true,
      })
      ctx.notice('Setup marked as complete!')
    }

    return (
      <Canvas ctx={ctx}>
        <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
            Welcome to Everything SVG!
          </h1>
          <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
            To use record-based storage for your SVGs, you need to create a
            model.
          </p>

          <div
            style={{
              background: 'var(--extra-light-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              padding: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
              Automatic Setup
            </h2>
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              Click below to automatically create the model:
            </p>
            <Button
              buttonSize="l"
              buttonType="primary"
              onClick={handleCreateModel}
              disabled={isCreatingModel}
            >
              {isCreatingModel ? (
                <>
                  <Spinner size={24} />
                  <span style={{ marginLeft: '0.5rem' }}>
                    Creating model...
                  </span>
                </>
              ) : (
                'Create SVG Model'
              )}
            </Button>

            <details style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              <summary
                style={{ cursor: 'pointer', color: 'var(--light-body-color)' }}
              >
                Or create manually...
              </summary>
              <ol
                style={{
                  marginLeft: '1.5rem',
                  marginTop: '0.75rem',
                  lineHeight: '1.6',
                }}
              >
                <li>Go to Settings → Models</li>
                <li>
                  Create model: Name = "Plugin SVG", API key = "plugin_svg"
                </li>
                <li>Add 4 fields: name, svg_content, svg_type, media_upload</li>
                <li>
                  <Button
                    buttonSize="s"
                    buttonType="muted"
                    onClick={handleMarkComplete}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Mark as complete
                  </Button>
                </li>
              </ol>
            </details>
          </div>

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--light-body-color)',
              fontStyle: 'italic',
            }}
          >
            Note: The plugin will work with parameter-based storage until you
            complete this setup.
          </p>
        </div>
      </Canvas>
    )
  }

  // Normal config screen after setup is complete
  return (
    <Canvas ctx={ctx}>
      <h1 style={{ marginBottom: '1rem' }}>Plugin Settings</h1>

      <Form>
        <FieldGroup>
          <SelectField
            name="pageType"
            id="pageType"
            label="Where do you want to show the menu item?"
            value={selectedPageType}
            selectInputProps={{
              options: pageTypeOptions,
            }}
            onChange={(newValue) => {
              const pageTypeValue = newValue as PageTypeOption
              saveSettings({
                pageType: pageTypeValue,
                menuItemPlacement: getMenuItemPlacements(
                  pageTypeValue.value,
                )[0],
              })
            }}
          />

          <SelectField
            name="placement"
            id="placement"
            label="Show the menu item before or after the other menu items?"
            value={selectedPlacement}
            selectInputProps={{
              options: placementOptions,
            }}
            onChange={(newValue) => {
              const placementValue = newValue as PlacementOption
              saveSettings({
                placement: placementValue,
              })
            }}
          />

          <SelectField
            name="menuItemPlacement"
            id="menuItemPlacement"
            label={`${
              selectedPlacement.value === 'before' ? 'Before' : 'After'
            } which menu item do you want to show the menu item?`}
            value={selectedMenuItemPlacement}
            selectInputProps={{
              options: getMenuItemPlacements(selectedPageType.value),
            }}
            onChange={(newValue) => {
              const menuItemPlacementValue = newValue as MenuItemPlacementOption
              saveSettings({ menuItemPlacement: menuItemPlacementValue })
            }}
          />
        </FieldGroup>
      </Form>

      {hasParameterSvgs && pluginParameters.isSetupComplete && (
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Migration</h3>
          <p>
            You have {pluginParameters.svgs!.length} SVG(s) stored in plugin
            parameters. Migrate them to records to avoid size limitations.
          </p>
          <Button
            buttonSize="m"
            buttonType="primary"
            onClick={handleMigration}
            disabled={isMigrating}
          >
            {isMigrating ? (
              <>
                <Spinner size={16} />
                <span style={{ marginLeft: '0.5rem' }}>Migrating...</span>
              </>
            ) : (
              'Migrate SVGs to Records'
            )}
          </Button>
        </div>
      )}
    </Canvas>
  )
}

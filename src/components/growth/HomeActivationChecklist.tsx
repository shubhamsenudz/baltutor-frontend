import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import {
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import type { SessionResponse } from '../../api/baltutor'
import { persistActivationChecklistDismissed } from './activationChecklistStorage'

/**
 * Guided activation: explicit “next wins” reduces post-signup drift (onboarding research).
 */
export function HomeActivationChecklist({
  session,
  dismissed,
  onDismiss,
}: {
  session: SessionResponse | null
  dismissed: boolean
  onDismiss: () => void
}) {
  if (dismissed || !session) return null

  const profileDone = session.classLevel != null && Boolean(session.board?.trim())

  const items = [
    {
      done: profileDone,
      primary: 'Saved your class, board & language',
      secondary: 'Owli can match NCERT level and tone.',
    },
    {
      done: false,
      primary: 'Do one homework question in the real app',
      secondary: 'Short session beats a perfect plan—start tiny.',
    },
    {
      done: false,
      primary: 'Come back for recall nudges',
      secondary: 'We’ll surface weak spots to revise in minutes, not hours.',
    },
  ]

  return (
    <Card
      sx={(t) => ({
        border: `1px solid ${t.palette.primary.dark}`,
        background: `linear-gradient(135deg, ${t.palette.primary.dark}22 0%, transparent 55%)`,
      })}
    >
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <div>
            <Typography variant="h6" component="h2" gutterBottom>
              Your first wins
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              High-retention products make the next step obvious. Here’s a simple path.
            </Typography>
          </div>
          <IconButton
            size="small"
            aria-label="Dismiss checklist"
            onClick={() => {
              persistActivationChecklistDismissed()
              onDismiss()
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <List disablePadding>
          {items.map((it) => (
            <ListItem key={it.primary} disableGutters sx={{ alignItems: 'flex-start', py: 1 }}>
              <ListItemIcon sx={{ minWidth: 40, mt: 0.25, color: it.done ? 'success.light' : 'text.disabled' }}>
                {it.done ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
              </ListItemIcon>
              <ListItemText
                primary={it.primary}
                secondary={it.secondary}
                primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 700 }}
                secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
              />
            </ListItem>
          ))}
        </List>
        <Button
          size="small"
          variant="text"
          onClick={() => {
            persistActivationChecklistDismissed()
            onDismiss()
          }}
          sx={{ mt: 0.5 }}
        >
          Don’t show again
        </Button>
      </CardContent>
    </Card>
  )
}

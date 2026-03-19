using System.Windows;
using System.Windows.Media;
using CmdManager.Models;

namespace CmdManager.Views
{
    public partial class RunCommandDialog : Window
    {
        private readonly Command _cmd;
        private bool _usePs = false;

        public RunCommandDialog(Command cmd)
        {
            InitializeComponent();
            _cmd = cmd;
            TitleText.Text = cmd.Name;

            if (cmd.Shell == "both")
            {
                ShellPicker.Visibility = Visibility.Visible;
                SetShell(false);
            }
            else
            {
                ShellPicker.Visibility = Visibility.Collapsed;
                _usePs = cmd.Shell == "powershell";
                SetShell(_usePs);
            }
        }

        private void SetShell(bool usePs)
        {
            _usePs = usePs;
            if (usePs)
            {
                TerminalBorder.Background = new SolidColorBrush(Color.FromRgb(0x01, 0x24, 0x56));
                ShellText.Text = "PowerShell";
                TerminalText.Foreground = new SolidColorBrush(Color.FromRgb(0xCC, 0xDD, 0xFF));
                TerminalText.Text = $"PS C:\\> {_cmd.CommandText}";
            }
            else
            {
                TerminalBorder.Background = new SolidColorBrush(Color.FromRgb(0x0C, 0x0C, 0x0C));
                ShellText.Text = "CMD";
                TerminalText.Foreground = new SolidColorBrush(Color.FromRgb(0xCC, 0xFF, 0xCC));
                TerminalText.Text = $"C:\\> {_cmd.CommandText}";
            }
        }

        private void Shell_Changed(object sender, RoutedEventArgs e)
        {
            if (IsInitialized)
                SetShell(UsePS.IsChecked == true);
        }

        private void Copy_Click(object sender, RoutedEventArgs e)
        {
            Clipboard.SetText(_cmd.CommandText);
            CopyBtn.Content = "✓ Copied!";
        }

        private void Close_Click(object sender, RoutedEventArgs e) => Close();
    }
}

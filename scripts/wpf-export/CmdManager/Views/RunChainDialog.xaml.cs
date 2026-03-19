using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using CmdManager.Models;

namespace CmdManager.Views
{
    public partial class RunChainDialog : Window
    {
        public RunChainDialog(CommandChain chain)
        {
            InitializeComponent();
            TitleText.Text = chain.Name;
            DescText.Text = chain.Description;

            for (int i = 0; i < chain.Steps.Count; i++)
            {
                var step = chain.Steps[i];
                bool isLast = i == chain.Steps.Count - 1;
                StepList.Children.Add(MakeStepRow(step, i + 1, isLast));
            }

            // Auto-copy last step
            if (chain.Steps.Count > 0)
                Clipboard.SetText(chain.Steps[^1].CommandText);
        }

        private UIElement MakeStepRow(CommandChainStep step, int num, bool isLast)
        {
            var border = new Border
            {
                Margin = new Thickness(0, 0, 0, 8),
                Background = isLast
                    ? new SolidColorBrush(Color.FromArgb(0x18, 0xF9, 0x73, 0x16))
                    : new SolidColorBrush(Color.FromArgb(0x10, 0xFF, 0xFF, 0xFF)),
                BorderBrush = isLast
                    ? new SolidColorBrush(Color.FromArgb(0x55, 0xF9, 0x73, 0x16))
                    : new SolidColorBrush(Color.FromArgb(0x22, 0xFF, 0xFF, 0xFF)),
                BorderThickness = new Thickness(1), CornerRadius = new CornerRadius(10),
                Padding = new Thickness(14, 10, 14, 10)
            };

            var grid = new Grid();
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            // Step number badge
            var numBadge = new Border
            {
                Width = 28, Height = 28,
                Background = isLast
                    ? new SolidColorBrush(Color.FromRgb(0xF9, 0x73, 0x16))
                    : new SolidColorBrush(Color.FromRgb(0x63, 0x66, 0xF1)),
                CornerRadius = new CornerRadius(14),
                Margin = new Thickness(0, 0, 12, 0), VerticalAlignment = VerticalAlignment.Top
            };
            numBadge.Child = new TextBlock
            {
                Text = num.ToString(), FontSize = 12, FontWeight = FontWeights.Bold,
                Foreground = Brushes.White, HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Center
            };
            Grid.SetColumn(numBadge, 0);
            grid.Children.Add(numBadge);

            // Step info
            var infoStack = new StackPanel();
            infoStack.Children.Add(new TextBlock
            {
                Text = step.Prefix, FontSize = 12,
                Foreground = isLast
                    ? new SolidColorBrush(Color.FromRgb(0xFB, 0xBF, 0x24))
                    : (Brush)FindResource("MutedTextBrush"),
                TextWrapping = TextWrapping.Wrap, Margin = new Thickness(0, 0, 0, 4)
            });
            infoStack.Children.Add(new TextBlock
            {
                Text = step.CommandText,
                FontFamily = new FontFamily("Consolas, Courier New"),
                FontSize = 12, Foreground = (Brush)FindResource("TextBrush"),
                TextWrapping = TextWrapping.Wrap
            });
            if (isLast)
                infoStack.Children.Add(new TextBlock
                {
                    Text = "📋 Auto-copied to clipboard",
                    FontSize = 11, Foreground = new SolidColorBrush(Color.FromRgb(0xF9, 0x73, 0x16)),
                    Margin = new Thickness(0, 4, 0, 0)
                });
            Grid.SetColumn(infoStack, 1);
            grid.Children.Add(infoStack);

            // Copy button
            var copyBtn = new Button
            {
                Content = "📋", Style = (Style)FindResource("GhostButton"),
                Padding = new Thickness(8), VerticalAlignment = VerticalAlignment.Top,
                Margin = new Thickness(8, 0, 0, 0)
            };
            copyBtn.Click += (s, e) =>
            {
                Clipboard.SetText(step.CommandText);
                copyBtn.Content = "✓";
            };
            Grid.SetColumn(copyBtn, 2);
            grid.Children.Add(copyBtn);

            border.Child = grid;
            return border;
        }

        private void Close_Click(object sender, RoutedEventArgs e) => Close();
    }
}

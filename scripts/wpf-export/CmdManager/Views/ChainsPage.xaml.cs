using System;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using CmdManager.Models;
using CmdManager.ViewModels;

namespace CmdManager.Views
{
    public partial class ChainsPage : Page
    {
        private AppViewModel VM => MainWindow.VM;
        private string _search = "";
        private string _category = "all";

        public ChainsPage()
        {
            InitializeComponent();
            LoadCategories();
            Refresh();
        }

        private void LoadCategories()
        {
            CategoryFilter.Items.Clear();
            CategoryFilter.Items.Add("all");
            foreach (var c in VM.Chains.Select(c => c.Category).Distinct().OrderBy(x => x))
                CategoryFilter.Items.Add(c);
            CategoryFilter.SelectedIndex = 0;
        }

        private void Refresh()
        {
            ChainList.Children.Clear();
            var filtered = VM.Chains
                .Where(c => (c.Name.Contains(_search, StringComparison.OrdinalIgnoreCase) ||
                             c.Description.Contains(_search, StringComparison.OrdinalIgnoreCase)) &&
                            (_category == "all" || c.Category == _category))
                .ToList();

            if (filtered.Count == 0)
            {
                ChainList.Children.Add(new TextBlock
                {
                    Text = "No chains found.", FontSize = 14, Margin = new Thickness(8),
                    Foreground = (System.Windows.Media.Brush)FindResource("MutedTextBrush")
                });
                return;
            }

            foreach (var chain in filtered)
                ChainList.Children.Add(MakeCard(chain));
        }

        private UIElement MakeCard(CommandChain chain)
        {
            var border = new Border
            {
                Width = 320, Margin = new Thickness(0, 0, 12, 12),
                Background = (System.Windows.Media.Brush)FindResource("CardBrush"),
                BorderBrush = (System.Windows.Media.Brush)FindResource("BorderBrush"),
                BorderThickness = new Thickness(1), CornerRadius = new CornerRadius(12),
                Padding = new Thickness(16), Cursor = System.Windows.Input.Cursors.Hand
            };

            var grid = new Grid();
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });
            grid.RowDefinitions.Add(new RowDefinition { Height = new GridLength(1, GridUnitType.Star) });
            grid.RowDefinitions.Add(new RowDefinition { Height = GridLength.Auto });

            // Header
            var header = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 0, 0, 4) };
            header.Children.Add(new TextBlock
            {
                Text = "⛓", FontSize = 14, VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(0, 0, 8, 0),
                Foreground = (System.Windows.Media.Brush)FindResource("AccentBrush")
            });
            var nameStack = new StackPanel();
            nameStack.Children.Add(new TextBlock
            {
                Text = chain.Name, FontSize = 14, FontWeight = FontWeights.SemiBold,
                Foreground = (System.Windows.Media.Brush)FindResource("TextBrush"),
                TextTrimming = TextTrimming.CharacterEllipsis
            });
            nameStack.Children.Add(new TextBlock
            {
                Text = $"{chain.Steps.Count} Steps", FontSize = 11,
                Foreground = (System.Windows.Media.Brush)FindResource("MutedTextBrush")
            });
            header.Children.Add(nameStack);
            Grid.SetRow(header, 0);
            grid.Children.Add(header);

            // Description
            var desc = new TextBlock
            {
                Text = chain.Description, FontSize = 12,
                Foreground = (System.Windows.Media.Brush)FindResource("MutedTextBrush"),
                TextWrapping = TextWrapping.Wrap, MaxHeight = 52,
                Margin = new Thickness(0, 4, 0, 12), TextTrimming = TextTrimming.CharacterEllipsis
            };
            Grid.SetRow(desc, 1);
            grid.Children.Add(desc);

            // Footer
            var footer = new Grid();
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            footer.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var badge = new Border
            {
                Background = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(0x8B, 0x5C, 0xF6)),
                CornerRadius = new CornerRadius(6), Padding = new Thickness(6, 3, 6, 3),
                HorizontalAlignment = HorizontalAlignment.Left, VerticalAlignment = VerticalAlignment.Center
            };
            badge.Child = new TextBlock { Text = chain.Category, FontSize = 11, FontWeight = FontWeights.SemiBold, Foreground = System.Windows.Media.Brushes.White };
            Grid.SetColumn(badge, 0);
            footer.Children.Add(badge);

            var btnPanel = new StackPanel { Orientation = Orientation.Horizontal };
            var runBtn = new Button { Content = "▶ Run", Style = (Style)FindResource("PrimaryButton"), Padding = new Thickness(10, 5, 10, 5), FontSize = 12 };
            runBtn.Click += (s, e) => { e.Handled = true; RunChain(chain); };
            var editBtn = new Button { Content = "✏", Style = (Style)FindResource("GhostButton"), Padding = new Thickness(7, 5, 7, 5), Margin = new Thickness(4, 0, 0, 0) };
            editBtn.Click += (s, e) => { e.Handled = true; EditChain(chain); };
            var delBtn = new Button { Content = "🗑", Style = (Style)FindResource("GhostButton"), Padding = new Thickness(7, 5, 7, 5), Margin = new Thickness(4, 0, 0, 0) };
            delBtn.Click += (s, e) => { e.Handled = true; DeleteChain(chain); };
            btnPanel.Children.Add(runBtn);
            btnPanel.Children.Add(editBtn);
            btnPanel.Children.Add(delBtn);
            Grid.SetColumn(btnPanel, 1);
            footer.Children.Add(btnPanel);

            Grid.SetRow(footer, 2);
            grid.Children.Add(footer);

            border.Child = grid;
            border.MouseLeftButtonUp += (s, e) => ShowDetail(chain);
            return border;
        }

        private void RunChain(CommandChain chain)
        {
            var dlg = new RunChainDialog(chain) { Owner = Window.GetWindow(this) };
            dlg.ShowDialog();
        }

        private void ShowDetail(CommandChain chain)
        {
            var dlg = new ChainDetailDialog(chain,
                onEdit: c => EditChain(c),
                onRun: c => RunChain(c),
                onDelete: id => DeleteChain(chain))
            { Owner = Window.GetWindow(this) };
            dlg.ShowDialog();
        }

        private void EditChain(CommandChain chain)
        {
            var dlg = new ChainFormDialog(chain) { Owner = Window.GetWindow(this) };
            if (dlg.ShowDialog() == true)
            {
                VM.UpdateChain(dlg.Result!);
                LoadCategories();
                Refresh();
            }
        }

        private void DeleteChain(CommandChain chain)
        {
            if (MessageBox.Show($"Delete \"{chain.Name}\"?", "Delete", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
            {
                VM.DeleteChain(chain.Id);
                LoadCategories();
                Refresh();
            }
        }

        private void AddChain_Click(object sender, RoutedEventArgs e)
        {
            var dlg = new ChainFormDialog(null) { Owner = Window.GetWindow(this) };
            if (dlg.ShowDialog() == true)
            {
                VM.AddChain(dlg.Result!);
                LoadCategories();
                Refresh();
            }
        }

        private void Search_Changed(object sender, TextChangedEventArgs e) { _search = SearchBox.Text; Refresh(); }
        private void Category_Changed(object sender, SelectionChangedEventArgs e) { _category = CategoryFilter.SelectedItem?.ToString() ?? "all"; Refresh(); }
    }
}
